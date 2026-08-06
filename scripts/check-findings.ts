// Applies the positive-detection verdict (design note §4) to the scan output and sets the exit code.
// This — not zap-baseline.py's exit status — is the lane's pass/fail signal.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { evaluate, formatVerdict } from '../src/findings/verdict.js';
import { PINS } from '../src/findings/expected-classes.js';
import type { ZapReport } from '../src/findings/zap-report.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = resolve(ROOT, 'reports/report.json');

if (!existsSync(REPORT)) {
  console.error(`dast: ${REPORT} not found — run \`npm run scan\` first.`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(REPORT, 'utf8')) as ZapReport;
const verdict = evaluate(report);

console.log(
  `dast: Juice Shop ${PINS.juiceShop.version} (intentionally vulnerable OWASP training target) ` +
    `scanned by ZAP ${PINS.zap.version}`,
);
console.log(formatVerdict(verdict));

process.exit(verdict.pass ? 0 : 1);
