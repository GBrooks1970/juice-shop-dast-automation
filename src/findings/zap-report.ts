// Typed model of ZAP's JSON report, plus normalisation to a comparable finding-class set.
//
// Only the fields the verdict depends on are modelled — ZAP's report carries far more, and
// pinning the whole shape would make us brittle to unrelated upstream additions.

/** ZAP risk bands, as they appear at the start of a report's `riskdesc` ("Medium (High)"). */
export const RISK_BANDS = ['Informational', 'Low', 'Medium', 'High', 'Critical'] as const;
export type RiskBand = (typeof RISK_BANDS)[number];

/** Risk bands that participate in the pass/fail verdict (design note §4). */
export const GATING_RISK_BANDS: readonly RiskBand[] = ['Low', 'Medium', 'High', 'Critical'];

interface RawInstance {
  uri?: string;
}

interface RawAlert {
  pluginid?: string;
  alert?: string;
  riskdesc?: string;
  count?: string | number;
  instances?: RawInstance[];
}

interface RawSite {
  '@name'?: string;
  alerts?: RawAlert[];
}

/** The subset of ZAP's report shape this project depends on. */
export interface ZapReport {
  site?: RawSite[];
}

/**
 * One finding class: the unit the gate reasons about. Deliberately excludes instance counts —
 * counts are an artifact of spider coverage and would break on any scope change (design note §4).
 */
export interface FindingClass {
  pluginId: string;
  name: string;
  risk: RiskBand;
}

/** Stable identity for comparing/deduplicating finding classes. */
export function classKey(finding: FindingClass): string {
  return `${finding.pluginId}|${finding.name}|${finding.risk}`;
}

/**
 * ZAP reports risk as e.g. "Medium (High)" — band first, confidence in parentheses.
 * Unrecognised values fall back to Informational so an upstream label change can never
 * silently promote something into the gating set.
 */
function parseRiskBand(riskdesc: string | undefined): RiskBand {
  const band = (riskdesc ?? '').split(' ')[0];
  return (RISK_BANDS as readonly string[]).includes(band) ? (band as RiskBand) : 'Informational';
}

/**
 * Reduce a raw ZAP report to its distinct finding classes, sorted for stable comparison.
 * Alerts missing a plugin id or name are skipped — they cannot be asserted against.
 */
export function normalise(report: ZapReport): FindingClass[] {
  const seen = new Map<string, FindingClass>();

  for (const site of report.site ?? []) {
    for (const alert of site.alerts ?? []) {
      if (!alert.pluginid || !alert.alert) continue;
      const finding: FindingClass = {
        pluginId: alert.pluginid,
        name: alert.alert,
        risk: parseRiskBand(alert.riskdesc),
      };
      seen.set(classKey(finding), finding);
    }
  }

  return [...seen.values()].sort((a, b) => classKey(a).localeCompare(classKey(b)));
}

/**
 * Keep only the bands that gate (design note §4): the Informational band was the sole source of
 * nondeterminism observed across the Phase 0 probe runs, so it is reported but never gates.
 */
export function gatingOnly(findings: FindingClass[]): FindingClass[] {
  return findings.filter((f) => GATING_RISK_BANDS.includes(f.risk));
}
