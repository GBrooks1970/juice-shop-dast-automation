// The expected-class contract (design note §4) — the heart of the positive-detection gate (D2.1a).
//
// PROVENANCE: verified stable across three ZAP baseline scans (fresh container / same container /
// fresh container) on 2026-08-06 — identical classes AND identical instance counts every run.
// Evidence: portfolio-docs/DAST_PHASE0_FEASIBILITY_PROBE_2026-08-06.md
//
// VALID ONLY FOR THE PINNED PAIR BELOW. Bumping either image invalidates this table: re-run the
// Phase 0 probe and re-review before accepting a bump (backlog trigger DAST-M1).

import type { FindingClass } from './zap-report.js';

/** The pinned target + scanner this contract was verified against. */
export const PINS = {
  juiceShop: {
    version: '20.1.1',
    digest: 'sha256:e68144772ebaaca0ec117b38d44903af92416793230288ef7c5437fc4f26850a',
  },
  zap: {
    version: '2.17.0',
    digest: 'sha256:8d387b1a63e3425beef4846e39719f5af2a787753af2d8b6558c6257d7a577a2',
  },
} as const;

/**
 * The security-misconfiguration and information-disclosure classes a passive baseline is expected
 * to detect on this target.
 *
 * NOTE ON SCOPE (design note §2.1): a passive baseline does not attack, so it detects NONE of the
 * injection classes (SQLi, XSS). Those are demonstrated by the BDD confirmation scenarios instead.
 * This table must never be described as proving detection of injection vulnerabilities.
 */
export const EXPECTED_CLASSES: readonly FindingClass[] = [
  { pluginId: '10038', name: 'Content Security Policy (CSP) Header Not Set', risk: 'Medium' },
  { pluginId: '10098', name: 'Cross-Domain Misconfiguration', risk: 'Medium' },
  { pluginId: '10063', name: 'Deprecated Feature Policy Header Set', risk: 'Low' },
  { pluginId: '10096', name: 'Timestamp Disclosure - Unix', risk: 'Low' },
  { pluginId: '10110', name: 'Dangerous JS Functions', risk: 'Low' },
  { pluginId: '90004', name: 'Cross-Origin-Embedder-Policy Header Missing or Invalid', risk: 'Low' },
  { pluginId: '90004', name: 'Cross-Origin-Opener-Policy Header Missing or Invalid', risk: 'Low' },
] as const;
