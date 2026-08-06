// Boots the pinned OWASP Juice Shop and runs a pinned ZAP passive baseline scan against it,
// writing report.json + report.html to reports/ (design note §3, §9).
//
// SAFETY (design note §7 — non-negotiable): the scan target is HARD-CODED to the local container
// on a private Docker network. It is deliberately NOT a parameter, env var or CLI argument, so
// there is no mechanism here capable of aiming a scan at any host we do not own. Do not add one.
//
// Juice Shop is an INTENTIONALLY VULNERABLE OWASP training target. Findings are expected.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = resolve(ROOT, 'reports');

// Pinned by digest — the expected-class contract in src/findings/expected-classes.ts is valid only
// for this exact pair. Bumping either requires re-running the Phase 0 probe (backlog DAST-M1).
const JUICE_SHOP_IMAGE =
  'bkimminich/juice-shop@sha256:e68144772ebaaca0ec117b38d44903af92416793230288ef7c5437fc4f26850a';
const ZAP_IMAGE =
  'ghcr.io/zaproxy/zaproxy@sha256:8d387b1a63e3425beef4846e39719f5af2a787753af2d8b6558c6257d7a577a2';

const NETWORK = 'juice-shop-dast';
const CONTAINER = 'juice-shop-dast-target';
const TARGET_PORT = 3000;
/** The one and only scan target. Not configurable — see the SAFETY note above. */
const TARGET_URL = `http://${CONTAINER}:${TARGET_PORT}`;

const docker = (args, opts = {}) => execFileSync('docker', args, { stdio: 'inherit', ...opts });
const dockerQuiet = (args) => spawnSync('docker', args, { stdio: 'ignore' });

function teardown() {
  console.log('dast: tearing down');
  dockerQuiet(['rm', '-f', CONTAINER]);
  dockerQuiet(['network', 'rm', NETWORK]);
}

/** Poll the published port until Juice Shop answers, so the spider never races an empty app. */
async function waitForReady(timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${TARGET_PORT}/`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`Juice Shop did not become ready within ${timeoutMs / 1000}s`);
}

teardown(); // clear anything a previous interrupted run left behind
rmSync(REPORTS, { recursive: true, force: true });
mkdirSync(REPORTS, { recursive: true });

try {
  console.log('dast: creating isolated network');
  docker(['network', 'create', NETWORK], { stdio: 'ignore' });

  console.log(`dast: starting Juice Shop (${JUICE_SHOP_IMAGE.split('@')[0]})`);
  docker([
    'run', '-d', '--name', CONTAINER, '--network', NETWORK,
    '-p', `${TARGET_PORT}:${TARGET_PORT}`,
    JUICE_SHOP_IMAGE,
  ], { stdio: 'ignore' });

  console.log('dast: waiting for readiness');
  await waitForReady();

  console.log(`dast: running ZAP passive baseline against ${TARGET_URL}`);
  // The ZAP container runs as a non-root user and must write into the mounted reports dir, so run
  // it as root here (the container is discarded immediately). Scope flags -m/-T bound the spider:
  // the bound is what makes the crawl — and therefore the findings set — repeatable.
  //
  // NOTE: zap-baseline.py exits NON-ZERO whenever any WARN exists, which is ALWAYS true for this
  // deliberately-vulnerable target. Its exit code is therefore NOT the verdict and must not be
  // treated as failure — the verdict comes from parsing report.json (npm run scan:verdict).
  const zap = spawnSync(
    'docker',
    [
      'run', '--rm', '--network', NETWORK, '-u', 'root',
      '-v', `${REPORTS}:/zap/wrk:rw`,
      ZAP_IMAGE,
      'zap-baseline.py', '-t', TARGET_URL,
      '-J', 'report.json', '-r', 'report.html',
      '-m', '2', '-T', '5',
    ],
    { stdio: 'inherit' },
  );
  console.log(`dast: zap-baseline.py exit=${zap.status} (non-zero is expected on this target)`);

  const reportJson = resolve(REPORTS, 'report.json');
  const reportHtml = resolve(REPORTS, 'report.html');
  if (!existsSync(reportJson) || !existsSync(reportHtml)) {
    console.error(
      'dast: ZAP did not write reports/report.{json,html} — check container write permissions ' +
        'on the mounted reports directory. Failing loudly rather than reporting a vacuous pass.',
    );
    process.exit(1);
  }
  console.log('dast: wrote reports/report.json + reports/report.html');
} finally {
  teardown();
}
