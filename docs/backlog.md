<!--
  AUDIENCE: Engineers and AI agents delivering this project. Written to be agent-agnostic:
            every phase is self-contained — an agent with no session history must be able to
            pick up the next unchecked phase from this file plus the referenced documents.
  PURPOSE:  Single source of truth for the phased delivery of juice-shop-dast-automation.
            Phases are strict sequential gates: a phase may not start until the previous
            phase's acceptance criteria are ALL ticked with evidence linked.
  LOCATION: docs/backlog.md
-->

# juice-shop-dast-automation — Backlog

**Version:** 4 — project initiated 2026-08-06. Phases 0-4 (probe, design, scan, BDD, CI+Pages)
complete + live; Phase 5 (onboard/close) outstanding. Binding design: [docs/dast-lane-design.md](dast-lane-design.md).

> **Framing (governs every artefact in this repo):** the scan target is OWASP Juice Shop, an
> **intentionally vulnerable** training application published by OWASP. It is **not a real product**
> and its findings are **expected**. Nothing here reports on the security of any real system.

## Decisions

Owner decisions **D2.1a–D2.7a** recorded 2026-08-05 in the portfolio design doc
`PORTFOLIO_PERF_AND_DAST_LANES_DESIGN_2026-08-05.md` §2.7; summarised in the design note §2.
Phase 0 produced two **implementation-precision amendments** (design note §2.1) — no decision reversed.

## Phases

### DAST-P0 — Feasibility probe — **DONE** (2026-08-06)
- [x] Pinned Juice Shop (20.1.1) + ZAP (2.17.0) boot and scan successfully.
- [x] Findings stability established over three runs (fresh / same-container / fresh).
- [x] Evidence recorded: `portfolio-docs/DAST_PHASE0_FEASIBILITY_PROBE_2026-08-06.md`.

### DAST-P1 — Design note (SDD) — **DONE** (2026-08-06)
- [x] `docs/dast-lane-design.md` v0.1 written before any implementation.
- [x] Records pins, expected-class contract, verdict rules, safety rules, phases.

### DAST-P2 — Scan orchestration + findings model — **DONE** (2026-08-06)
- [x] Container orchestration: private network, pinned Juice Shop, readiness wait, pinned ZAP baseline
      scoped by container name (never a configurable URL — design note §7). `scripts/run-scan.mjs`
- [x] TypeScript findings model + `verdict()` (design note §5), with the expected-class table as data.
      `src/findings/{zap-report,expected-classes,verdict}.ts`
- [x] Unit tests against committed probe fixtures, covering pass, **missing-class**, and
      **unexpected-class** failure modes (a real scan cannot produce these on demand) — plus
      empty-report and downgraded-risk cases. **14 tests.**
- [x] `npm run verify` gate = typecheck + unit tests (Docker-free, fast). `npm audit` = 0 vulnerabilities.
- **Acceptance MET:** verdict logic is fully tested without booting a container; a real local scan
  (a 4th independent run) reproduced the seven expected classes and returned **PASS**, exit 0, with
  clean teardown.
- **Note:** `npm run scan:verdict` — not `zap-baseline.py`'s exit status — is the lane's pass/fail
  signal; that script exits non-zero on every run of this target by design.

### DAST-P3 — BDD confirmation scenarios (D2.4b) — **DONE** (2026-08-06)
- [x] Cucumber/TypeScript hand-rolled Screenplay layer (house idiom), `node --import tsx/esm`.
- [x] Scenario 1 — sensitive file exposure: confidential `/ftp/acquisitions.md` (200) **and** the
      poison-null-byte backup-filter bypass. **Both verified against the pinned image** before writing.
- [x] Scenario 2 — SQL-injection login bypass: `' OR 1=1--` yields an admin JWT (`admin@juice-sh.op`).
      **Verified** — the earlier "candidate" caveat is discharged.
- [x] Scenario 3 — **broken access control (IDOR)**: one user's token reads another user's basket via
      `/rest/basket/{id}`. Chosen over XSS (which reflected empty on this build). **Verified.**
- [x] Each scenario names in-code the documented vulnerability + OWASP class, and comments the
      deliberate inverted polarity (the test asserts the exploit *succeeds*).
- **Acceptance MET:** 4 scenarios / 11 steps pass deterministically against the live pinned container
  (`npm run bdd`, boots → runs → tears down, clean); dry-run binds all steps; nothing was described
  before it demonstrably worked. `@cucumber/cucumber` pinned to ^13 to keep `npm audit` at 0 (v11
  pulled a moderate `uuid` transitive advisory; v13's `@cucumber/messages@34` drops it).

### DAST-P4 — CI + published labelled report (D2.6a) — **DONE** (2026-08-06)
- [x] Workflow `.github/workflows/ci.yml`: verify → scan → verdict → BDD → build-pages → deploy;
      PR-blocking; SHA-pinned actions (house pins). Each Docker step boots + tears down.
- [x] `reports/` (JSON + HTML) uploaded as the `zap-report` CI artifact.
- [x] `scripts/build-pages.ts` renders a labelled index (framing banner, honest scope split, verdict,
      detected classes) + copies the full ZAP report. Verified rendering locally and live.
- [x] Framing banner (design note §1) enforced by `tests/build-pages.test.ts` (21 unit tests total).
- [x] Owner go-ahead to create the public remote **given 2026-08-06**.
- [x] Public repo <https://github.com/GBrooks1970/juice-shop-dast-automation> created + pushed;
      CI green on `main` (verify + scan + verdict + BDD all pass on hosted runners).
- [x] **Pages LIVE + correctly labelled: <https://gbrooks1970.github.io/juice-shop-dast-automation/>**
      (HTTP 200; framing banner, PASS verdict, 7 classes, both pinned versions; full ZAP report at
      `/zap-report.html`).
- **Acceptance MET.**
- **Deploy note:** the first Pages deploy repeatedly stalled at `deployment_queued` then cancelled.
  Root cause was a stuck backend Pages build (`483275fc`) plus, after a delete+recreate of the Pages
  site, a slow first deploy exceeding the 10-min job timeout. Fix = cancel the stuck build via
  `POST /repos/{r}/pages/deployments/{sha}/cancel`, recreate the Pages site, and raise the deploy job
  timeout to 30 min (action to 20). Not a workflow-logic defect.

### DAST-P5 — Onboarding + close-out — *outstanding*
- [ ] README (with framing), `onboard-project` registry row, landing-page evidence link.
- [ ] Session-notes handover v1.

## Standing maintenance triggers

- **DAST-M1 — version-bump re-verification.** Any bump of the Juice Shop or ZAP pin **invalidates the
  expected-class contract** (design note §4). Re-run the Phase 0 probe, re-review the baseline, and
  re-verify the BDD scenarios before accepting the bump.

## Outstanding risks

- **R1 — misreading of published findings.** Mitigated by the mandatory framing on every surface; this
  is the project's top non-technical requirement and must be checked at every publish.
- **R2 — BDD/vuln coupling.** Exploit scenarios are tied to specific Juice Shop vulnerabilities and can
  break on a version bump — covered by DAST-M1.
