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

**Version:** 14 — **DAST-M5 closed; all delivery phases and maintenance complete; resting** (2026-10-07): the repeatability probe now runs on Windows (PR #12, `ba76110`). Previous v13 opened DAST-M5. Previous v12: **DAST-M4 closed; all delivery phases and maintenance complete; resting** (2026-09-10).
All delivery phases DAST-P0…P5, review items JSA-R01…R04, and maintenance items DAST-M3 and DAST-M4
remain complete and live. DAST-M4 is closed: dev-only transitive `nanoid` was constrained to `>=3.3.18`
via package overrides (resolving `nanoid@3.3.19`) and `vitest` was updated to `^4.1.11` (resolving
`@vitest/mocker@4.1.11`), achieving zero vulnerabilities on `npm audit`. `npm run verify` (typecheck +
21 unit tests) and `npm run bdd:dry` passed 100% green without runtime or architectural churn. The
project has **0 outstanding items** and transitions to **Resting**. R1/R2 remain standing
mitigations, while DAST-M1/M2 remain dormant conditional triggers. Previous v7 completed the Gemini
v1 remediation by consolidating container utilities, enabling configurable port allocation,
introducing strongly typed Screenplay memory keys, and pruning unused findings-model interfaces.
Binding design: [docs/dast-lane-design.md](dast-lane-design.md).

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

### DAST-P5 — Onboarding + close-out — **DONE** (2026-08-06, verified 2026-08-10)
- [x] README (with framing): `README.md` carries the mandatory "About the target" banner (design
      note §1) alongside the honest passive/active scope split and the pinned-version table.
- [x] `onboard-project` registry row: registered in `portfolio-prompts/registry.yml` with
      `presentation_role: showcase`, `orchestration_target: true`, and the Docker-free
      `npm run verify` recorded as the orchestration-safe gate. The lifecycle remains `active` while
      DAST-M4 is open; transition to `resting` only after the canonical open count returns to zero.
- [x] Landing-page evidence link: the live landing data
      (<https://gbrooks1970.github.io/portfolio/data/presentation.json>) carries the
      `OWASP Juice Shop DAST` entry with a `DAST scan report` action pointing at
      <https://gbrooks1970.github.io/juice-shop-dast-automation/>.
- [x] Session-notes handover v1: `juice-shop-dast-automation_session-notes_v1_20260806T1601Z.md`
      (with its `.html` companion) in `session-notes/` at the portfolio root.
- **Acceptance MET:** verified 2026-08-10 — the live landing entry resolves and the linked report
  page returns HTTP 200. All six phases DAST-P0…P5 are complete. Standing mitigations and dormant
  maintenance triggers remain governed below; the later DAST-M3 repeatability defect is separate
  open maintenance work and does not reopen the delivered phases.

## Current lifecycle and risk summary

**Lifecycle status:** Resting — delivered, published, and zero open backlog items remain.

| Priority | Open count | Current state |
|---|---:|---|
| HIGH | 0 | No open items |
| MEDIUM | 0 | No open items (DAST-M4 closed 2026-09-10) |
| LOW | 0 | No open items (DAST-M5 closed 2026-10-07) |
| **Total outstanding** | **0** | All items resolved; R1/R2 mitigated; DAST-M1/M2 dormant |

## Maintenance items

### DAST-M3 — Stabilise passive-baseline crawl coverage — **MEDIUM — CLOSED 2026-09-08**

**Resolution.** PR [#7](https://github.com/GBrooks1970/juice-shop-dast-automation/pull/7)
adds ZAP's bounded Ajax spider (`-j`) so the Angular application executes and browser-loaded
JavaScript is deterministically presented to the passive scanner. Its required checks passed on the
first attempt, and exact-merge run
[`34200533176`](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34200533176)
passed on `main`. The on-demand, fail-closed repeatability run
[`34200784522`](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34200784522)
then passed three independent fresh-container scans: each reported 158 URLs, all seven expected
gating classes, and the same class set. The final BDD confirmation passed 4 scenarios / 11 steps.
No scan or workflow was rerun. The project remains active because DAST-M4 is open.

**Original problem.** The positive-detection contract was fail-closed as designed, but its inputs
were not repeatable. On PR #6, workflow run
[`34133748394`](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34133748394)
used the unchanged pinned Juice Shop 20.1.1 and ZAP 2.17.0 images on both attempts:

- attempt 1 crawled 20 requests / 11 unique URLs, omitted `main.js` and two JavaScript chunks, and
  failed after detecting only 3 of 7 gating classes; expected plugins 10063, 10110 and both 90004
  alert names were missing;
- the unchanged attempt 2 crawled 33 requests / 14 unique URLs, included `main.js` and additional
  chunks, detected all 7 gating classes, and passed; all 4 BDD scenarios / 11 steps then passed.

This proves crawl/resource-discovery nondeterminism despite identical application and scanner image
digests. A retry can recover, but retrying is evidence of the defect rather than a remedy. Because
the gate fails closed, this causes false-red PR checks rather than silently accepting a missed class;
it still undermines the repository's documented deterministic-gate claim and can block unrelated
changes.

**Acceptance criteria.** Preserve the hard-coded local target, private Docker network, passive-only
scope, and the positive-detection/new-class guards. Do not suppress expected classes merely to make
the gate green. Instead:

- [x] identify and document the source of variable SPA JavaScript discovery;
- [x] make the resources needed by the reviewed class contract deterministic (for example, through
      reviewed fixed seeds or an equivalently bounded passive crawl), without adding a configurable
      external scan target or active scanning;
- [x] capture a fresh probe showing the same expected class set across at least three independent
      fresh-container scans and update the contract provenance/design note with that evidence;
- [x] keep `npm run verify` green and prove all 4 BDD scenarios / 11 steps still pass;
- [x] obtain green required PR checks without relying on a manual rerun, then reconcile the lifecycle
      to `resting` only if no other canonical backlog item is open.

### DAST-M4 — Remediate the transitive `nanoid` infinite-loop advisory — **MEDIUM — CLOSED 2026-09-10**

**Resolution.** Constrained the dev-only transitive `nanoid` dependency to `^3.3.18` via npm `overrides`
in `package.json` (resolving `nanoid@3.3.19` under `vite@8.3.0` → `postcss@8.5.28`) and updated `vitest`
to `^4.1.11` (resolving `@vitest/mocker@4.1.11`, remediating GHSA-82fw-gwwq-j7x9). `npm audit` reports
0 vulnerabilities (`found 0 vulnerabilities`). Local verification (`npm run verify`, running typecheck
and 21 unit tests) passed cleanly in 1.15s, and Cucumber step bindings verified via `npm run bdd:dry`
(4 scenarios / 11 steps). With all backlog items complete, the project transitions to `resting`.

**Original problem.** Priority score: Security Impact (4) + Breakage Probability (3) + Maintenance
Burden (5) = **12 points**. `npm audit` reported GHSA-2v37-7h3g-55p8 as HIGH severity for `nanoid <3.3.18`.
The locked `nanoid@3.3.17` was dev-only and reached through `vitest → vite → postcss → nanoid`, which
limited exposure to repository-controlled test/build input, but a patched compatible release was
available and the project did not retain the advisory.

**Acceptance criteria:**

- [x] constrain the transitive dependency to `nanoid >=3.3.18` without broad dependency churn;
- [x] regenerate the lockfile and prove `npm audit` reports zero vulnerabilities;
- [x] keep `npm run verify` green and record the remediation evidence before lifecycle closure.

### DAST-M5 — Make the repeatability probe run on Windows — **LOW — CLOSED 2026-10-07**

**Resolution.** PR [#12](https://github.com/GBrooks1970/juice-shop-dast-automation/pull/12), merged as `ba76110`, adds `scripts/run-npm.mjs`, which
starts npm through `process.execPath` and `npm_execpath` (with a fallback), and the probe uses it. `npm run verify` passes with 27 tests (6 new;
5 of them fail against the old behaviour). `npm run scan:repeatability` on Windows passed on the branch (exit 0 in 425 s) and on merged `main`
(exit 0 in 496 s), each with three scans reporting the same seven gating classes. The dispatched `DAST repeatability probe` run
[`37602040336`](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/37602040336) passed on Linux; PR and post-merge `ci`
runs passed. Log: [`2026-10-07_dast-m5-windows-safe-repeatability-probe.md`](implementation-logs/2026-10-07_dast-m5-windows-safe-repeatability-probe.md).

**Original problem.** On Windows with Node 24.18.0, `npm run scan:repeatability` exits 1 in 6 s, before any container starts:
`dast: repeatability probe 1/3 could not start: spawnSync npm.cmd EINVAL`. `scripts/run-repeatability-probe.mjs`
spawned `npm.cmd` without a shell, which current Node refuses on Windows. The `DAST repeatability probe` workflow runs on
`ubuntu-latest` and is unaffected, so the defect only blocks local Windows runs. Found by running Learning Paths stage 4.4
(portfolio walkthrough `2026-10-06_learning-paths-docker-stages.md`).

**Plan.** [`docs/implementation-plans/2026-10-07_dast-m5-windows-safe-repeatability-probe.md`](implementation-plans/2026-10-07_dast-m5-windows-safe-repeatability-probe.md).
Spawn npm through `process.execPath` and `process.env.npm_execpath` (no shell), with a fallback when it is unset (shell on
Windows with constant arguments, plain `npm` elsewhere). Only the probe changes.

**Acceptance criteria:**

- [x] `npm run verify` passes with new unit tests for the spawn helper, including one that fails against the old approach — typecheck clean, 27 tests in 3 files (21 before; 6 new). With the old behaviour swapped in (`npm.cmd`, no shell), 5 of the 6 new tests failed, including the real spawn with `spawnSync npm.cmd EINVAL`; the helper was restored and all 6 pass (2026-10-07);
- [x] `npm run scan:repeatability` on Windows passes, or fails with a recorded, separate cause — passed on 2026-10-07 (Windows, Node 24.18.0, Docker on `E:`): exit 0 in 425 s; three fresh-container scans each reported 7 gating classes and the same class set (`repeatability-reports/summary.json` `result: PASS`);
- [x] the `DAST repeatability probe` workflow, dispatched on the branch, passes on Linux — run [`37602040336`](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/37602040336) on `3d7c84d`: success in 4 min 23 s; three scans, 7 gating classes each, same set; BDD exploit confirmations 4 scenarios / 11 steps passed;
- [x] the item is closed (log, plan Outcome, lifecycle back to Resting) in a follow-up PR after the merge — this change.

## Standing maintenance triggers

These triggers are persistent controls, not open backlog items. Promote the affected trigger to an
open, scored item only when its condition fires.

- **DAST-M1 — version-bump re-verification.** Any bump of the Juice Shop or ZAP pin **invalidates the
  expected-class contract** (design note §4). Re-run the Phase 0 probe, re-review the baseline, and
  re-verify the BDD scenarios before accepting the bump. **Status: dormant** — both image pins remain
  unchanged from the Phase 0 baseline.
- **DAST-M2 — `actions/upload-artifact` runtime deprecation.** Added 2026-08-10. CI annotates every
  run: the pin `actions/upload-artifact@ea165f8` (v4.6.2) targets Node 20 and is force-run on Node
  24. Warning only — not a failure — and the rest of the workflow is already on the v5/v6 lines.
  Deferred deliberately: `upload-artifact` is at v7.x, so this is a multi-major jump whose release
  notes must be reviewed (v4 introduced immutable artifacts) rather than a routine pin bump.
  **Trigger:** the annotation becoming an error, or any other workflow change touching this step.
  **Status: dormant** — baseline `main` run `32266005705` (2026-08-19) completed successfully and
  emitted the recorded warning; as at this reconciliation, no later repository change had touched
  this workflow step. Mirrors the same trigger-gated treatment as parabank's PBR-02.

## Standing controls and mitigations

These controls remain mandatory but are not open work and therefore do not contribute to the H/M/L
counts above.

- **R1 — misreading of published findings.** Mitigated by the mandatory framing on every surface; this
  is the project's top non-technical requirement and must be checked at every publish. **Status:
  mitigated by a persistent publication control.**
- **R2 — BDD/vuln coupling.** Exploit scenarios are tied to specific Juice Shop vulnerabilities and can
  break on a version bump — covered by DAST-M1. **Status: mitigated while the reviewed pins remain
  unchanged.**
