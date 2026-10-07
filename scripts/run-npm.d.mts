import type { SpawnSyncOptions, SpawnSyncReturns } from 'node:child_process';

export interface NpmInvocation {
  command: string;
  args: string[];
  options: { shell?: boolean };
}

export function npmInvocation(
  args: string[],
  env?: NodeJS.ProcessEnv,
  platform?: NodeJS.Platform,
  execPath?: string,
): NpmInvocation;

export function runNpm(
  args: string[],
  spawnOptions?: SpawnSyncOptions,
  env?: NodeJS.ProcessEnv,
): SpawnSyncReturns<string | Buffer>;
