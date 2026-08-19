// Boots the pinned OWASP Juice Shop, runs the BDD exploit-confirmation scenarios against it, and
// tears down (design note §6, §9). Mirrors run-scan.mjs.
//
// SAFETY (design note §7): the scenarios exploit an INTENTIONALLY VULNERABLE target. They run only
// against the container this script starts on the host port; JUICE_SHOP_URL is set to that local instance.
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import {
  JUICE_SHOP_IMAGE,
  stopAndRemoveContainer,
  waitForReady,
  getJuiceShopPort,
} from './docker-utils.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTAINER = 'juice-shop-bdd-target';
const PORT = getJuiceShopPort(3000);

function teardown() {
  console.log('bdd: tearing down');
  stopAndRemoveContainer(CONTAINER);
}

teardown();
let failed = false;
try {
  console.log(`bdd: starting Juice Shop (${JUICE_SHOP_IMAGE.split('@')[0]}) on port ${PORT}`);
  execFileSync('docker', ['run', '-d', '--name', CONTAINER, '-p', `${PORT}:3000`, JUICE_SHOP_IMAGE], {
    stdio: 'ignore',
  });
  await waitForReady(PORT);
  console.log('bdd: running exploit-confirmation scenarios');
  // Invoke cucumber via node --import tsx/esm so the TypeScript steps load without a build step and
  // without relying on shell/NODE_OPTIONS behaviour (portable across bash and pwsh).
  const cucumberBin = resolve(ROOT, 'node_modules/@cucumber/cucumber/bin/cucumber.js');
  execFileSync('node', ['--import', 'tsx/esm', cucumberBin], {
    stdio: 'inherit',
    cwd: ROOT,
    env: {
      ...process.env,
      JUICE_SHOP_URL: `http://localhost:${PORT}`,
    },
  });
} catch (err) {
  failed = true;
  console.error(`bdd: ${err instanceof Error ? err.message : err}`);
} finally {
  teardown();
}
process.exit(failed ? 1 : 0);

