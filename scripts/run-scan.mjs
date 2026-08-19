// Boots the pinned OWASP Juice Shop and runs a pinned ZAP passive baseline scan against it,
// writing report.json + report.html to reports/ (design note §3, §9).
//
// SAFETY (design note §7 — non-negotiable): the scan target is HARD-CODED to the local container
// on a private Docker network. It is deliberately NOT a parameter, env var or CLI argument, so
// there is no mechanism here capable of aiming a scan at any host we do not own. Do not add one.
//
// Juice Shop is an INTENTIONALLY VULNERABLE OWASP training target. Findings are expected.
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import {
  JUICE_SHOP_IMAGE,
  ZAP_IMAGE,
  docker,
  stopAndRemoveContainer,
  removeNetwork,
  waitForReady,
} from './docker-utils.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = resolve(ROOT, 'reports');

const NETWORK = 'juice-shop-dast';
const CONTAINER = 'juice-shop-dast-target';
const TARGET_PORT = 3000;
/** The one and only scan target. Not configurable — see the SAFETY note above. */
const TARGET_URL = `http://${CONTAINER}:${TARGET_PORT}`;

function teardown() {
  console.log('dast: tearing down');
  stopAndRemoveContainer(CONTAINER);
  removeNetwork(NETWORK);
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
  await waitForReady(TARGET_PORT);

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
