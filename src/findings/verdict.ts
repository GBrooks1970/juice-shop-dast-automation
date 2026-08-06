// The gate's decision function (design note §4). Pure: report in, verdict out — no I/O, no Docker,
// so every branch (including the failure modes a real scan will not produce on demand) is testable.

import { classKey, gatingOnly, normalise, type FindingClass, type ZapReport } from './zap-report.js';
import { EXPECTED_CLASSES } from './expected-classes.js';

export interface Verdict {
  pass: boolean;
  /** Expected classes the scan did NOT find — the scan stopped detecting something it should. */
  missing: FindingClass[];
  /** Classes found that are not in the reviewed baseline — the new-class guard. */
  unexpected: FindingClass[];
  /** Every gating class the scan found, for reporting. */
  found: FindingClass[];
  /** Non-gating (Informational) classes: reported, never gating (design note §4). */
  informational: FindingClass[];
}

/**
 * Decide pass/fail for a ZAP baseline report.
 *
 * Both directions matter and both fail the gate:
 *  - MISSING: positive detection's whole point — if an expected class disappears, the scan has
 *    stopped detecting something it demonstrably used to, which means the lane is broken (bad
 *    scope, changed target) even though "fewer findings" superficially looks like good news.
 *  - UNEXPECTED: the new-class guard (replacing a new-HIGH guard, which could never fire since a
 *    passive baseline of this target produces no HIGH at all — design note §2.1).
 */
export function evaluate(
  report: ZapReport,
  expected: readonly FindingClass[] = EXPECTED_CLASSES,
): Verdict {
  const all = normalise(report);
  const found = gatingOnly(all);
  const informational = all.filter((f) => !found.includes(f));

  const foundKeys = new Set(found.map(classKey));
  const expectedKeys = new Set(expected.map(classKey));

  const missing = expected.filter((e) => !foundKeys.has(classKey(e)));
  const unexpected = found.filter((f) => !expectedKeys.has(classKey(f)));

  return {
    pass: missing.length === 0 && unexpected.length === 0,
    missing: [...missing],
    unexpected,
    found,
    informational,
  };
}

/** Human-readable verdict for CI logs — states the honest scope of what passed. */
export function formatVerdict(verdict: Verdict): string {
  const lines: string[] = [];
  lines.push(
    verdict.pass
      ? 'DAST verdict: PASS — every expected finding class was detected, and nothing unexpected appeared.'
      : 'DAST verdict: FAIL',
  );

  if (verdict.missing.length > 0) {
    lines.push(`  MISSING (${verdict.missing.length}) — expected but not detected by this scan:`);
    for (const f of verdict.missing) lines.push(`    - [${f.pluginId}] ${f.name} (${f.risk})`);
  }
  if (verdict.unexpected.length > 0) {
    lines.push(`  UNEXPECTED (${verdict.unexpected.length}) — not in the reviewed baseline:`);
    for (const f of verdict.unexpected) lines.push(`    - [${f.pluginId}] ${f.name} (${f.risk})`);
  }

  lines.push(
    `  Detected ${verdict.found.length} gating class(es); ` +
      `${verdict.informational.length} informational class(es) reported but not gating.`,
  );
  lines.push(
    '  Scope: this asserts detection of security-misconfiguration and information-disclosure ' +
      'classes. A passive baseline does not attack, so injection classes (SQLi/XSS) are proven ' +
      'by the BDD confirmation scenarios, not by this scan.',
  );
  return lines.join('\n');
}
