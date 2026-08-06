// DAST confirmation lane runner config (design note §6). Serial by default — the scenarios share a
// single live target and the SQL-injection bypass seeds the token the IDOR scenario reuses.
// tsx/esm loads the TypeScript steps and the ESM screenplay modules without a build step.
// TS steps/screenplay are loaded via `node --import tsx/esm` (see the bdd scripts), not a cucumber
// `loader` entry — tsx v4 deprecated --loader in favour of --import.
export default {
  paths: ['features/**/*.feature'],
  import: ['features/support/**/*.ts', 'features/steps/**/*.ts'],
  format: ['progress'],
  strict: true,
};
