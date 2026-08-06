// Verdict-logic tests. These run against JSON captured from the real Phase 0 probe scans, so the
// gate's logic is fully exercised WITHOUT booting a container — fast, deterministic, and able to
// cover failure modes (missing / unexpected class) that a real scan cannot produce on demand.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { evaluate, formatVerdict } from '../src/findings/verdict.js';
import { EXPECTED_CLASSES } from '../src/findings/expected-classes.js';
import { classKey, gatingOnly, normalise, type ZapReport } from '../src/findings/zap-report.js';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const load = (name: string): ZapReport => JSON.parse(readFileSync(join(fixtures, name), 'utf8'));

const run1 = load('zap-baseline-run1.json');
const run3Fresh = load('zap-baseline-run3-fresh.json');

describe('normalise', () => {
  it('reduces a real ZAP report to distinct finding classes', () => {
    const classes = normalise(run1);
    expect(classes.length).toBeGreaterThan(0);
    expect(classes.every((c) => c.pluginId && c.name && c.risk)).toBe(true);
  });

  it('parses the risk band from ZAP\'s "Band (Confidence)" riskdesc', () => {
    const csp = normalise(run1).find((c) => c.pluginId === '10038');
    expect(csp?.risk).toBe('Medium');
  });

  it('treats an unrecognised risk label as Informational so it can never silently gate', () => {
    const odd: ZapReport = {
      site: [{ alerts: [{ pluginid: '99999', alert: 'Odd', riskdesc: 'Bogus (High)' }] }],
    };
    expect(normalise(odd)[0]?.risk).toBe('Informational');
    expect(gatingOnly(normalise(odd))).toHaveLength(0);
  });

  it('skips alerts lacking a plugin id or name, which cannot be asserted against', () => {
    const partial: ZapReport = {
      site: [{ alerts: [{ alert: 'No id', riskdesc: 'Medium (High)' }, { pluginid: '1' }] }],
    };
    expect(normalise(partial)).toHaveLength(0);
  });
});

describe('evaluate — real probe reports', () => {
  it('passes the reference scan (run 1)', () => {
    const verdict = evaluate(run1);
    expect(verdict.missing).toEqual([]);
    expect(verdict.unexpected).toEqual([]);
    expect(verdict.pass).toBe(true);
  });

  it('passes the fresh-container scan (run 3) — the intended production shape', () => {
    expect(evaluate(run3Fresh).pass).toBe(true);
  });

  it('detects exactly the seven contracted gating classes', () => {
    expect(evaluate(run1).found).toHaveLength(EXPECTED_CLASSES.length);
  });

  it('is unaffected by the Informational instability seen between runs 1 and 3', () => {
    // Plugin 10049 (cache classification) differed between these two real scans — the sole
    // nondeterminism the probe found. It must land in `informational`, never in the verdict.
    const info1 = evaluate(run1).informational.map(classKey);
    const info3 = evaluate(run3Fresh).informational.map(classKey);
    expect(info1).not.toEqual(info3);
    expect(evaluate(run1).pass).toBe(evaluate(run3Fresh).pass);
    expect(info1.some((k) => k.startsWith('10049|'))).toBe(true);
  });
});

describe('evaluate — failure modes', () => {
  it('FAILS when an expected class is missing (the scan stopped detecting something)', () => {
    const verdict = evaluate(run1, [
      ...EXPECTED_CLASSES,
      { pluginId: '40012', name: 'Cross Site Scripting (Reflected)', risk: 'High' },
    ]);
    expect(verdict.pass).toBe(false);
    expect(verdict.missing.map((f) => f.pluginId)).toEqual(['40012']);
    expect(verdict.unexpected).toEqual([]);
  });

  it('FAILS on an unexpected class — the new-class guard', () => {
    const withExtra: ZapReport = JSON.parse(JSON.stringify(run1));
    withExtra.site?.[0]?.alerts?.push({
      pluginid: '40018',
      alert: 'SQL Injection',
      riskdesc: 'High (Medium)',
      count: '1',
    });
    const verdict = evaluate(withExtra);
    expect(verdict.pass).toBe(false);
    expect(verdict.unexpected.map((f) => f.name)).toEqual(['SQL Injection']);
    expect(verdict.missing).toEqual([]);
  });

  it('FAILS an empty report rather than vacuously passing on zero findings', () => {
    // The trap positive detection exists to avoid: "no findings" must never read as success.
    const verdict = evaluate({ site: [] });
    expect(verdict.pass).toBe(false);
    expect(verdict.missing).toHaveLength(EXPECTED_CLASSES.length);
  });

  it('does not let an Informational-band finding satisfy an expected gating class', () => {
    const downgraded: ZapReport = {
      site: [
        {
          alerts: [
            {
              pluginid: '10038',
              alert: 'Content Security Policy (CSP) Header Not Set',
              riskdesc: 'Informational (High)',
            },
          ],
        },
      ],
    };
    const verdict = evaluate(downgraded);
    expect(verdict.pass).toBe(false);
    expect(verdict.missing.map((f) => f.pluginId)).toContain('10038');
  });
});

describe('formatVerdict', () => {
  it('states the honest scope on a pass, naming what the scan does NOT prove', () => {
    const text = formatVerdict(evaluate(run1));
    expect(text).toContain('PASS');
    expect(text).toMatch(/passive baseline does not attack/i);
    expect(text).toMatch(/BDD confirmation scenarios/i);
  });

  it('lists both missing and unexpected classes on a failure', () => {
    const broken: ZapReport = {
      site: [{ alerts: [{ pluginid: '40018', alert: 'SQL Injection', riskdesc: 'High (Medium)' }] }],
    };
    const text = formatVerdict(evaluate(broken));
    expect(text).toContain('FAIL');
    expect(text).toContain('MISSING');
    expect(text).toContain('UNEXPECTED');
  });
});
