// Boots the pinned OWASP Juice Shop, runs the BDD exploit-confirmation scenarios against it, and
// tears down (design note §6, §9). Mirrors run-scan.mjs.
//
// SAFETY (design note §7): the scenarios exploit an INTENTIONALLY VULNERABLE target. They run only
// against the container this script starts on the host port; JUICE_SHOP_URL is left at its default.
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const JUICE_SHOP_IMAGE =
  'bkimminich/juice-shop@sha256:e68144772ebaaca0ec117b38d44903af92416793230288ef7c5437fc4f26850a';
const CONTAINER = 'juice-shop-bdd-target';
const PORT = 3000;

const dockerQuiet = (args) => spawnSync('docker', args, { stdio: 'ignore' });

function teardown() {
  console.log('bdd: tearing down');
  dockerQuiet(['rm', '-f', CONTAINER]);
}

async function waitForReady(timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`Juice Shop did not become ready within ${timeoutMs / 1000}s`);
}

teardown();
let failed = false;
try {
  console.log(`bdd: starting Juice Shop (${JUICE_SHOP_IMAGE.split('@')[0]})`);
  execFileSync('docker', ['run', '-d', '--name', CONTAINER, '-p', `${PORT}:${PORT}`, JUICE_SHOP_IMAGE], {
    stdio: 'ignore',
  });
  await waitForReady();
  console.log('bdd: running exploit-confirmation scenarios');
  // Invoke cucumber via node --import tsx/esm so the TypeScript steps load without a build step and
  // without relying on shell/NODE_OPTIONS behaviour (portable across bash and pwsh).
  const cucumberBin = resolve(ROOT, 'node_modules/@cucumber/cucumber/bin/cucumber.js');
  execFileSync('node', ['--import', 'tsx/esm', cucumberBin], { stdio: 'inherit', cwd: ROOT });
} catch (err) {
  failed = true;
  console.error(`bdd: ${err instanceof Error ? err.message : err}`);
} finally {
  teardown();
}
process.exit(failed ? 1 : 0);
