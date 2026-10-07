// Starts npm in a way that works on Windows as well as Linux (backlog DAST-M5).
// Current Node refuses to spawn a `.cmd` such as `npm.cmd` without a shell on Windows (spawnSync EINVAL),
// so under `npm run` npm is started through node and the `npm_execpath` that npm itself provides.
import { spawnSync } from 'node:child_process';

/**
 * Describes how to start npm with the given arguments.
 *
 * 1. `npm_execpath` set (the normal case under `npm run`): node plus npm's own CLI script, no shell.
 *    Identical on every platform.
 * 2. Otherwise on Windows: `npm` through a shell. A shell concatenates its arguments without escaping,
 *    so only constant arguments may be passed on this path.
 * 3. Otherwise: plain `npm`.
 */
export function npmInvocation(
  args,
  env = process.env,
  platform = process.platform,
  execPath = process.execPath,
) {
  if (env.npm_execpath) {
    return { command: execPath, args: [env.npm_execpath, ...args], options: {} };
  }
  if (platform === 'win32') {
    return { command: 'npm', args, options: { shell: true } };
  }
  return { command: 'npm', args, options: {} };
}

/** Runs npm synchronously with the given arguments; returns the `spawnSync` result. */
export function runNpm(args, spawnOptions = {}, env = process.env) {
  const { command, args: argv, options } = npmInvocation(args, env);
  return spawnSync(command, argv, { ...options, ...spawnOptions, env });
}
