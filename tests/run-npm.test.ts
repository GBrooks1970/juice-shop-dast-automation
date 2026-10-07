// Guards the Windows-safe way the repeatability probe starts npm (backlog DAST-M5). On Windows, current
// Node cannot spawn `npm.cmd` without a shell (EINVAL), and the first two tests below pin the choices that
// avoid it; the last two spawn a real `npm --version` through each path so the host's behaviour is proven,
// not assumed.

import { describe, expect, it } from 'vitest';

import { npmInvocation, runNpm } from '../scripts/run-npm.mjs';

const NODE = 'C:\\node\\node.exe';
const NPM_CLI = 'C:\\node\\node_modules\\npm\\bin\\npm-cli.js';

describe('npmInvocation', () => {
  it('starts npm through node and npm_execpath, with no shell, on Windows', () => {
    const run = npmInvocation(['run', 'dast'], { npm_execpath: NPM_CLI }, 'win32', NODE);
    expect(run).toEqual({ command: NODE, args: [NPM_CLI, 'run', 'dast'], options: {} });
  });

  it('starts npm the same way on Linux when npm_execpath is set', () => {
    const run = npmInvocation(['run', 'dast'], { npm_execpath: '/usr/lib/node_modules/npm/bin/npm-cli.js' }, 'linux', '/usr/bin/node');
    expect(run.command).toBe('/usr/bin/node');
    expect(run.args).toEqual(['/usr/lib/node_modules/npm/bin/npm-cli.js', 'run', 'dast']);
    expect(run.options.shell).toBeUndefined();
  });

  it('falls back to npm through a shell on Windows when npm_execpath is unset', () => {
    expect(npmInvocation(['run', 'dast'], {}, 'win32', NODE)).toEqual({
      command: 'npm',
      args: ['run', 'dast'],
      options: { shell: true },
    });
  });

  it('falls back to plain npm without a shell on Linux when npm_execpath is unset', () => {
    expect(npmInvocation(['run', 'dast'], {}, 'linux', '/usr/bin/node')).toEqual({
      command: 'npm',
      args: ['run', 'dast'],
      options: {},
    });
  });
});

describe('runNpm (real spawn)', () => {
  it('runs `npm --version` through the fallback path (npm_execpath unset)', () => {
    const env = { ...process.env };
    delete env.npm_execpath;
    const result = runNpm(['--version'], { encoding: 'utf8' }, env);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(String(result.stdout).trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it.runIf(Boolean(process.env.npm_execpath))('runs `npm --version` through npm_execpath', () => {
    const result = runNpm(['--version'], { encoding: 'utf8' });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(String(result.stdout).trim()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
