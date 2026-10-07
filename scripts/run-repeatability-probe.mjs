// Runs the fail-closed DAST contract three times from fresh containers and records whether the
// reviewed gating class set is identical. This is an explicit evidence probe, not a retry: any
// failed iteration stops the probe and remains a failure.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { runNpm } from './run-npm.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = resolve(ROOT, 'reports');
const EVIDENCE = resolve(ROOT, 'repeatability-reports');
const RUNS = 3;
const GATING_BANDS = new Set(['Low', 'Medium', 'High', 'Critical']);

function gatingClasses(report) {
  const classes = new Set();
  for (const site of report.site ?? []) {
    for (const alert of site.alerts ?? []) {
      const risk = (alert.riskdesc ?? '').split(' ')[0];
      if (alert.pluginid && alert.alert && GATING_BANDS.has(risk)) {
        classes.add(`${alert.pluginid}|${alert.alert}|${risk}`);
      }
    }
  }
  return [...classes].sort();
}

rmSync(EVIDENCE, { recursive: true, force: true });
mkdirSync(EVIDENCE, { recursive: true });

const evidence = [];
for (let run = 1; run <= RUNS; run += 1) {
  console.log(`dast: repeatability probe ${run}/${RUNS} — fresh Juice Shop and ZAP containers`);
  // Via run-npm.mjs: spawning `npm.cmd` directly fails on Windows with EINVAL (backlog DAST-M5).
  const result = runNpm(['run', 'dast'], { cwd: ROOT, stdio: 'inherit' });
  if (result.error) {
    console.error(`dast: repeatability probe ${run}/${RUNS} could not start: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`dast: repeatability probe FAIL — run ${run}/${RUNS} exited ${result.status}`);
    process.exit(1);
  }

  const runDir = resolve(EVIDENCE, `run-${run}`);
  mkdirSync(runDir, { recursive: true });
  cpSync(resolve(REPORTS, 'report.json'), resolve(runDir, 'report.json'));
  cpSync(resolve(REPORTS, 'report.html'), resolve(runDir, 'report.html'));
  const report = JSON.parse(readFileSync(resolve(runDir, 'report.json'), 'utf8'));
  const classes = gatingClasses(report);
  evidence.push({ run, gatingClassCount: classes.length, gatingClasses: classes });
  console.log(`dast: repeatability probe ${run}/${RUNS} PASS — ${classes.length} gating classes`);
}

const baseline = JSON.stringify(evidence[0].gatingClasses);
const mismatch = evidence.find(({ gatingClasses: classes }) => JSON.stringify(classes) !== baseline);
if (mismatch) {
  console.error(`dast: repeatability probe FAIL — run ${mismatch.run} produced a different class set`);
  process.exit(1);
}

const summary = {
  result: 'PASS',
  independentFreshContainerScans: RUNS,
  gatingClassCount: evidence[0].gatingClassCount,
  runs: evidence,
};
writeFileSync(resolve(EVIDENCE, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(
  `dast: repeatability probe PASS — ${RUNS}/${RUNS} fresh-container scans produced ` +
    `the same ${summary.gatingClassCount}-class gating set`,
);
