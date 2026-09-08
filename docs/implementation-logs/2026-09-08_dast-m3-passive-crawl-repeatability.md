# DAST-M3 Passive Crawl Repeatability — 2026-09-08

## Session Summary

The goal was to remove nondeterministic Angular resource discovery from the passive ZAP gate without
weakening its positive-detection contract or adding active scanning. Browser-backed discovery and a
fail-closed repeatability probe were implemented, PR #7 and its exact merge commit passed on the first
attempt, and three further fresh-container scans produced the same seven-class gating set. DAST-M3 is
closed; the project remains active because the separately recorded DAST-M4 dependency advisory is open.

---

## Objectives

1. ✅ Identify and document why the traditional spider intermittently missed SPA-loaded JavaScript.
2. ✅ Make passive discovery deterministic while preserving the pinned, private-network target.
3. ✅ Prove three fresh scans have identical gating sets and all 4 BDD scenarios / 11 steps still pass.
4. ✅ Close DAST-M3 and preserve the newly observed dependency risk as separate backlog item DAST-M4.

---

## Test Results

| Stack | Suite | Before | After | Status |
|---|---|---|---|---|
| TypeScript / Vitest | Typecheck + unit tests | 21/21 passed | 21/21 passed | ✅ PASS |
| ZAP 2.17.0 / Juice Shop 20.1.1 | PR-blocking passive gate | PR #6 first attempt detected 3/7; unchanged rerun detected 7/7 | PR #7 first attempt detected 7/7 from 158 URLs | ✅ PASS |
| GitHub Actions / Docker | Independent repeatability probe | Not established after PR #6 | 3/3 fresh-container scans; 158 URLs and identical 7-class gating set in each | ✅ PASS |
| Cucumber / TypeScript | Exploit confirmations | 4 scenarios / 11 steps passed | 4 scenarios / 11 steps passed | ✅ PASS |

Evidence:

- [PR #7](https://github.com/GBrooks1970/juice-shop-dast-automation/pull/7) merged as
  `1fc6706ec472af011ff1bedfd3a5c8d1fbf550fe`.
- [PR run 34200202969](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34200202969)
  passed without rerun: 7 gating classes, 4 scenarios and 11 steps.
- [Exact-merge run 34200533176](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34200533176)
  passed on `main`, including the labelled Pages deployment.
- [Repeatability run 34200784522](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34200784522)
  passed in 4m21s: all three independent scans reported 158 URLs and the same seven gating classes;
  the final BDD suite passed all 4 scenarios / 11 steps.
- Local Docker execution was unavailable because the Docker Desktop Linux engine returned HTTP 503;
  no local pull or scan was attempted. Docker-backed acceptance therefore used GitHub-hosted runners.

---

## Changes Implemented

### Execute the Angular SPA during bounded passive discovery

**Files changed:**

- `scripts/run-scan.mjs` — passes `-j` to the pinned ZAP baseline so its Ajax spider executes the SPA;
  retains the two-minute spider bound, hard-coded container target, private network and passive scan.
- `docs/dast-lane-design.md` — records the failure mechanism, amended discovery contract and evidence.
- `src/findings/expected-classes.ts` — adds the successful 2026-09-08 revalidation provenance.

### Add explicit, fail-closed repeatability evidence

**Files changed:**

- `scripts/run-repeatability-probe.mjs` — runs the existing `npm run dast` path exactly three times,
  preserves each report, and rejects a failed verdict or any difference in the gating class set.
- `.github/workflows/dast-repeatability.yml` — provides a manually dispatched three-scan acceptance job
  followed by the existing BDD suite.
- `package.json` — exposes the probe as `npm run scan:repeatability`.
- `.gitignore` — excludes the probe's local evidence directory.

### Align operator documentation and lifecycle state

**Files changed:**

- `README.md` — documents the four-scenario suite and the repeatability command.
- `docs/backlog.md` — closes DAST-M3 with run evidence while keeping the project active for DAST-M4.
- `docs/templates/implementation-log.template.md` — imports the portfolio template required before this
  repository's first immutable implementation log.

---

## Technical Decisions

| Decision | Rationale | Alternatives rejected |
|---|---|---|
| Add ZAP baseline `-j` | The traditional spider does not execute the Angular SPA; the Ajax spider makes browser-loaded resources visible to passive rules and remains bounded by `-m 2`. | Retrying a red gate, suppressing missing classes, active scanning, or manually curating application asset URLs. |
| Keep the three-run probe manually dispatched | Three full scans are appropriate acceptance evidence but would triple every routine PR's Docker cost. | Automatic retries and three scans on every PR. |
| Fail on each verdict and on set drift | A scan must independently satisfy the reviewed contract; equality alone could make three identically incomplete scans look stable. | Comparing only counts or accepting a majority result. |
| Record the `nanoid` advisory as DAST-M4 | It is real, separately scoped work discovered during clean installation and prevents a truthful resting transition. | Expanding DAST-M3 into unreviewed dependency churn or ignoring the advisory. |

---

## Documentation Updates

- `README.md` — repeatability operation and correct BDD count.
- `docs/dast-lane-design.md` — DAST-M3 design amendment and acceptance evidence.
- `docs/backlog.md` — DAST-M3 closure, DAST-M4 risk and active lifecycle.
- `docs/implementation-logs/2026-09-08_dast-m3-passive-crawl-repeatability.md` — this immutable record.
- `docs/templates/implementation-log.template.md` — local canonical template for future logs.

---

## Lessons Learned

- Digest pins stabilise component identity, not discovery coverage: a traditional crawler can report the
  same aggregate URL count while omitting the JavaScript resources that drive specific passive rules.
- Repeatability evidence must validate every run independently and compare semantic class sets; retries
  and aggregate counts can conceal the defect under test.
- Fresh dependency installation is a useful lifecycle gate: it exposed DAST-M4 before a false resting
  transition could be recorded.

---

## Recommendations / Next Steps

- [ ] Resolve [DAST-M4](../backlog.md#dast-m4--remediate-the-transitive-nanoid-infinite-loop-advisory--score-12-medium--open-2026-09-08)
  with a narrow transitive constraint, zero-vulnerability audit and green verification — MEDIUM.
- [ ] Transition the project to `resting` only after DAST-M4 is closed and the canonical open count is zero.

---

*Session logged: 2026-09-08. Author: Codex.*
