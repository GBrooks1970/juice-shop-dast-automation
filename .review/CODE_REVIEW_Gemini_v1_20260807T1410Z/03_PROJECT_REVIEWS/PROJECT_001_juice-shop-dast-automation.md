# Project Review: juice-shop-dast-automation

[<- Back to Index](../00_CODE_REVIEW_Gemini_v1_20260807T1410Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (Gemini)
**Date:** 2026-08-07T14:10Z
**Target Repository:** `juice-shop-dast-automation`

---

## Architectural Pattern and Stack

- **Technology Stack:** Node.js (>=20), TypeScript (5.9), Vitest (4.0), Cucumber (13.2), tsx (4.20), OWASP ZAP (2.17.0), OWASP Juice Shop (20.1.1), Docker.
- **Architectural Approach:**
  - **Scan Verdict Subsystem:** Pure functional model (`ZapReport` -> `normalise` -> `evaluate` -> `Verdict`) with immutable expected class tables.
  - **Exploit Confirmation Subsystem:** Lightweight hand-rolled Screenplay design pattern (`Actor`, `Ability`, `Task`, `Question`) communicating via native fetch APIs against Juice Shop endpoints.
- **Container Isolation:** Scan traffic runs inside a private Docker bridge network (`juice-shop-dast`) hardcoded to `http://juice-shop-dast-target:3000`.

---

## Code Quality and Maintainability

- **Strict Type System:** Strong TypeScript interfaces for ZAP JSON reports, findings classes, verdict data, and Screenplay entities.
- **Zero Build Step for Execution:** Script runners leverage `tsx` and `node --import tsx/esm` to execute TypeScript files directly in ESM mode.
- **High Test Fidelity:** 21 unit tests run in sub-second time via Vitest without needing Docker containers.
- **Clean Error Handling:** Explicit validation in `check-findings.ts` and `build-pages.ts` ensuring non-zero exit codes on report parsing errors or verdict failures.

---

## Test Coverage and Approach

- **Passive Scan Gate:** Asserts 7 specific misconfiguration/disclosure classes:
  1. CSP Header Not Set (Plugin 10038, Medium)
  2. Cross-Domain Misconfiguration (Plugin 10098, Medium)
  3. Deprecated Feature Policy Header (Plugin 10063, Low)
  4. Timestamp Disclosure Unix (Plugin 10096, Low)
  5. Dangerous JS Functions (Plugin 10110, Low)
  6. Cross-Origin-Embedder-Policy Header Missing/Invalid (Plugin 90004, Low)
  7. Cross-Origin-Opener-Policy Header Missing/Invalid (Plugin 90004, Low)
- **Active Exploitation Scenarios (4 BDD Scenarios / 11 Steps):**
  1. SQLi login bypass as `admin@juice-sh.op`.
  2. Sensitive document disclosure via `/ftp/acquisitions.md`.
  3. Poison null byte extension filter bypass (`/ftp/coupons_2013.md.bak%2500.md`).
  4. IDOR broken access control reading unauthorized shopping basket (`/rest/basket/2`).

---

## Documentation Quality

- **Design Document (SDD):** [`docs/dast-lane-design.md`](docs/dast-lane-design.md) provides comprehensive architecture details, decision log (D2.1a-D2.7a), security constraints, and expected finding tables.
- **Backlog Tracking:** [`docs/backlog.md`](docs/backlog.md) records detailed phase progress, probe evidence, decisions, and outstanding items.
- **Mandatory Framing Discipline:** Clear warning notices across all outputs ensuring findings are understood as expected behavior of an intentionally vulnerable training app.

---

## Strengths and Weaknesses

### Strengths
1. **Positive Detection Verdict Concept:** Innovative gating strategy that asserts expected findings must be detected rather than naively expecting 0 findings on a vulnerable app.
2. **Fast Fast-Feedback Loop:** Fast unit tests (`npm run verify`) test all verdict branches using fixture JSON files in milliseconds without container overhead.
3. **Safety Enforcement:** Target URLs are immutable and scoped exclusively to container network aliases.

### Weaknesses
1. **Host Port Contention:** Hardcoded host port 3000 in `run-bdd.mjs` could conflict with local processes.
2. **Runner Script Code Duplication:** Docker setup and readiness polling logic is repeated across `run-scan.mjs` and `run-bdd.mjs`.

---

[<- Back to Index](../00_CODE_REVIEW_Gemini_v1_20260807T1410Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
```

---