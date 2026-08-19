// Shared container utilities and lifecycle helpers for DAST scan and BDD runners.
import { execFileSync, spawnSync } from 'node:child_process';

// Pinned by digest — the expected-class contract in src/findings/expected-classes.ts is valid only
// for this exact pair. Bumping either requires re-running the Phase 0 probe (backlog DAST-M1).
export const JUICE_SHOP_IMAGE =
  'bkimminich/juice-shop@sha256:e68144772ebaaca0ec117b38d44903af92416793230288ef7c5437fc4f26850a';
export const ZAP_IMAGE =
  'ghcr.io/zaproxy/zaproxy@sha256:8d387b1a63e3425beef4846e39719f5af2a787753af2d8b6558c6257d7a577a2';

export const docker = (args, opts = {}) =>
  execFileSync('docker', args, { stdio: 'inherit', ...opts });

export const dockerQuiet = (args) =>
  spawnSync('docker', args, { stdio: 'ignore' });

export function stopAndRemoveContainer(containerName) {
  dockerQuiet(['rm', '-f', containerName]);
}

export function removeNetwork(networkName) {
  dockerQuiet(['network', 'rm', networkName]);
}

/**
 * Resolves host port for Juice Shop container.
 * Supports JUICE_SHOP_PORT environment variable for dynamic port allocation in concurrent/CI runs.
 */
export function getJuiceShopPort(defaultPort = 3000) {
  if (process.env.JUICE_SHOP_PORT) {
    const parsed = parseInt(process.env.JUICE_SHOP_PORT, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return defaultPort;
}

/**
 * Poll the published port until Juice Shop answers HTTP requests.
 */
export async function waitForReady(port = 3000, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`Juice Shop did not become ready on port ${port} within ${timeoutMs / 1000}s`);
}
