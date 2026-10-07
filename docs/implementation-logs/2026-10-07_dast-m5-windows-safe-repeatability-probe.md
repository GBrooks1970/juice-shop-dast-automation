# DAST-M5 — Windows-safe repeatability probe — 2026-10-07

## Session Summary

Learning Paths stage 4.4 ran `npm run scan:repeatability` on a Windows machine and it failed in 6 s, before any container started:
`dast: repeatability probe 1/3 could not start: spawnSync npm.cmd EINVAL`. The probe spawned `npm.cmd` without a shell, which current
Node refuses on Windows. PR #12, merged as `ba76110`, starts npm through `process.execPath` and `npm_execpath` (with a fallback), so the
probe now runs on Windows as it already did on Linux. The same command, run on the merged `main`, passed three fresh-container scans
with an identical seven-class gating set. DAST-M5 is closed and the project returns to Resting.

The implementation followed an approved plan
([`docs/implementation-plans/2026-10-07_dast-m5-windows-safe-repeatability-probe.md`](../implementation-plans/2026-10-07_dast-m5-windows-safe-repeatability-probe.md));
the owner approved every recommended option on 2026-10-07 and merged the PR.

---

## Objectives

1. ✅ Make `npm run scan:repeatability` start and run on Windows, with no change to its behaviour on Linux.
2. ✅ Keep the change confined to the probe (one new module, one changed script, one new test file).
3. ✅ Prove it three ways: unit tests including a failing case, a real Windows run, and a Linux CI dispatch on the branch.
4. ✅ Open DAST-M5 in the backlog, record the plan before the code, and close the item after the merge with the evidence.

---

## Test Results

| Stack | Suite | Before | After | Status |
|---|---|---|---|---|
| TypeScript | `npm run verify` (typecheck + Vitest) | 21 tests, 2 files | typecheck clean, **27 tests, 3 files** (6 new) | ✅ PASS |
| TypeScript | New tests against the old behaviour (`npm.cmd`, no shell) | n/a | 5 of 6 new tests **fail**, including the real spawn with `spawnSync npm.cmd EINVAL`; helper restored, 6 of 6 pass | ✅ failing case observed |
| Windows (Node 24.18.0, Docker on `E:`) | `npm run scan:repeatability` before the fix | exit 1 in 6 s (`EINVAL`) | n/a | ❌ the defect |
| Windows | `npm run scan:repeatability` on the branch (`bc8021e`) | n/a | exit 0 in 425 s; 3 scans, 7 gating classes each, identical | ✅ PASS |
| Windows | `npm run scan:repeatability` on merged `main` (`ba76110`) | n/a | exit 0 in 496 s; 3 scans, 7 gating classes each, identical (`summary.json` `result: PASS`) | ✅ PASS |
| Linux CI | `DAST repeatability probe` dispatched on the branch, run `37602040336` (on `3d7c84d`) | n/a | success in 4 min 23 s; 3 scans, 7 classes each; BDD 4 scenarios / 11 steps | ✅ PASS |
| CI | PR `ci` run `37602632927` (on `bc8021e`) | n/a | success | ✅ PASS |
| CI | Post-merge `ci` run `37602921298` (on `ba76110`, 3 min 15 s) | n/a | success | ✅ PASS |

The seven gating classes are the same set the DAST-M3 evidence recorded. Memory was checked before the local runs (Docker VM 7.65 GiB,
about 2 GiB used by another session's Saleor stack, which was not touched).

---

## Changes Implemented

### Windows-safe npm spawn

**Files changed:**
- `scripts/run-npm.mjs` (new) — `npmInvocation(args, env, platform, execPath)` and `runNpm(args, spawnOptions, env)`. With `npm_execpath` set it
  starts `process.execPath` plus that script, no shell (identical on every platform). Otherwise on Windows it uses `npm` through a shell, and
  elsewhere plain `npm`. The shell path is documented as constant-arguments-only.
- `scripts/run-npm.d.mts` (new) — types, so the strict TypeScript tests can import the module.
- `scripts/run-repeatability-probe.mjs` — the `npm`/`npm.cmd` constant and its `spawnSync` call replaced by `runNpm(['run', 'dast'], { cwd, stdio })`.
  The three runs, the evidence copying, the class-set comparison and the exit codes are unchanged.
- `tests/run-npm.test.ts` (new) — four tests on the invocation choice and two real `npm --version` spawns, one per path.

### Plan and backlog

**Files changed:**
- `docs/implementation-plans/` (new folder: the plan and `_index.md`) and `docs/templates/implementation-plan.template.md` — the plan was committed before any code.
- `docs/backlog.md` — DAST-M5 opened in PR #12 (v13); closed in this follow-up (v14), with the lifecycle back to Resting.

---

## Technical Decisions

| Decision | Rationale | Alternatives rejected |
|---|---|---|
| Start npm through `node` and `npm_execpath`, with a fallback when it is unset | Same on every OS, no shell and no warning in the normal path (the probe is always run through `npm run`) | `shell: true` only (prints Node's DEP0190 warning every run and concatenates arguments); run `scan` and `scan:verdict` directly (duplicates the `dast` composition and can drift from `package.json`) |
| Keep the helper a plain `.mjs` with a `.d.mts` | The probe runs under plain `node`, so it cannot import a `.ts` file | Move the probe to `tsx` |
| Fix only the probe | It was the only broken spawn in this repository | Wider refactor of the other scripts (they spawn `docker` and `node`, which work) |
| Leave the registry and landing page alone | The item opened and closed in one cycle; the project is Resting again, and the landing parity guards make extra edits costly | Refresh the registry label date |
| Verify locally and by CI dispatch on the branch | The dispatch is the only proof that Linux behaviour is unchanged | Local only |

---

## Documentation Updates

- `docs/backlog.md` — DAST-M5 closed, lifecycle Resting, counts back to zero (v14).
- `docs/implementation-plans/2026-10-07_dast-m5-windows-safe-repeatability-probe.md` and `_index.md` — status implemented, `delivered` filled, Outcome appended; the approved body is unchanged.
- This log.

---

## Lessons Learned

- Spawning a `.cmd` directly is a Windows-only failure that Linux CI cannot show. A real-spawn unit test is what catches it: the test that spawns
  `npm --version` with `npm_execpath` unset failed against the old approach with the same `EINVAL` seen in stage 4.4.
- `npm_execpath` exists only under an npm-launched process. A first draft that used it unconditionally worked via `npm run` and failed when the
  script was run directly with `node`; the scratch trial that showed this is why the fallback exists.
- Under a mutation check, five of the six new tests failed, not one: the invocation tests pin the shape of the result, and only two touch a real
  process. That is the right balance for a helper this small.
- The evidence run on the merged `main` (496 s) took longer than on the branch (425 s). Both are single runs on one machine, with another
  session's containers running; the durations are observations, not a benchmark.
- A stale `.git/index.lock` (0 bytes, a week old, no git process running) blocked git in this repository before work started. It was removed,
  as git's own message instructs.

---

## Recommendations / Next Steps

- [x] The portfolio's Learning Paths stage 4.4 and finding 7 are updated in a companion PR in the portfolio repository — done alongside this PR.
- [ ] The same Windows failure exists in loan-origination-parity's `tools/build-reports.mjs` (backlog Risk #3 there) — owner / low.

---

*Session logged: 2026-10-07. Author: Claude (Sonnet 5.5); owner: Gary Brooks.*
