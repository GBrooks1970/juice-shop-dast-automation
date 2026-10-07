---
version: 1
created: 2026-10-07T09:25Z
project: juice-shop-dast-automation
type: implementation-plan
item: DAST-M5
status: approved
approved: 2026-10-07, Gary Brooks ("Approved, go with recommendations", every recommended option below); the owner merges
delivered: not yet
language: en-GB
---

# Implementation plan: DAST-M5 Make the repeatability probe run on Windows

**Goal.** `npm run scan:repeatability` should work on Windows as it already does on Linux. Today it exits 1 in 6 s with
`spawnSync npm.cmd EINVAL` before any container starts (Learning Paths stage 4.4). The fix is confined to the probe and must not
change its behaviour on Linux, where the manually dispatched `DAST repeatability probe` workflow runs it.

## Evidence gathered before planning

Read-only review and a scratch trial on 2026-10-07, on Windows with Node 24.18.0. Nothing in the repository was changed.

| Finding | Consequence for the plan |
|---|---|
| `scripts/run-repeatability-probe.mjs:36` runs `spawnSync(npm, ['run', 'dast'], …)` with `npm = 'npm.cmd'` on `win32` and no shell. Current Node refuses to spawn a `.cmd` that way (`EINVAL`). | The spawn is the defect; nothing else in the probe needs to change. |
| Trial in a scratch package, run via `npm run`: `npm.cmd` without a shell gave `EINVAL`; `process.execPath` plus `process.env.npm_execpath` without a shell worked (exit 0); `shell: true` with constant arguments worked but printed a DEP0190 warning. | Prefer `node` plus `npm_execpath`: same on both operating systems and no shell. |
| The same trial run directly with `node probe.mjs` (outside npm): `npm_execpath` was undefined, so the `npm_execpath` form failed (exit 1). | A fallback is required for direct invocation. |
| `.github/workflows/dast-repeatability.yml` is manually dispatched on `ubuntu-latest` (30-minute timeout) and runs `npm run scan:repeatability`. | Linux behaviour must be unchanged; prove it with a dispatch on the branch. |
| `npm run verify` on `main` at `b2b4ec3`: typecheck clean, 21 unit tests in 2 files. | The baseline to extend. |
| The project is resting with 0 open items (backlog v12); the registry says `status: resting`, label "Closed 2026-09-10". DAST-M3 and DAST-M4 are the precedent for reopening it with a maintenance item. | Open DAST-M5 and close it in the same cycle; leave the registry and landing page alone. |
| `tsconfig.json` includes only `src/**/*.ts` and `tests/**/*.ts` and has `strict` without `allowJs`. | A new `.mjs` module needs a `.d.mts` for the TypeScript tests to import it. |
| `scripts/run-scan.mjs` uses a private Docker network and no host ports. | No port clash with other containers on the machine (for example Saleor on 8000). |

## Steps

1. Branch `chore/dast-m5-windows-safe-repeatability-probe` from `main`. Create `docs/implementation-plans/` with this plan and an
   `_index.md`; copy `templates/implementation-plan.template.md` into `docs/templates/`. Commit these first, before any code.
2. `docs/backlog.md` (v13): open DAST-M5, LOW, maintenance, with the evidence above and "CI unaffected".
3. Add `scripts/run-npm.mjs` exporting `npmInvocation(args, env, platform)` and `runNpm(args, spawnOptions)`:
   - if `env.npm_execpath` is set: `command = process.execPath`, `args = [npm_execpath, ...args]`, no shell;
   - else if `platform === 'win32'`: `command = 'npm'`, `options.shell = true`; the arguments must be constants (documented in the file);
   - else: `command = 'npm'`, no shell.
   Add `scripts/run-npm.d.mts` so the tests can import it under `strict`.
4. `scripts/run-repeatability-probe.mjs`: replace the `npm` constant and its `spawnSync` call with `runNpm(['run', 'dast'], …)`. Keep the
   same `cwd`, `env`, `stdio`, error handling and exit codes. Nothing else changes.
5. `tests/run-npm.test.ts`: three pure tests of `npmInvocation` (execpath set; unset on `win32`; unset on `linux`), and two real
   spawns of `npm --version` (one through the `npm_execpath` path when it is defined, one with an empty environment through the
   fallback). Run `npm run verify`; expect typecheck clean and about 26 tests.
6. Local proof: `npm run scan:repeatability` on this Windows machine (three fresh Juice Shop and ZAP scans), with exit codes and
   timings. Check free memory first and stop if it is too tight. Do not touch other sessions' containers. Record the result as it is,
   including any second Windows failure.
7. Linux proof: dispatch `DAST repeatability probe` on the branch (`gh workflow run dast-repeatability.yml --ref <branch>`) and record the run ID and result.
8. Push the branch and open a PR against `main` (not merged; the owner merges), citing steps 5 to 7.
9. After the merge, in separate PRs: the juice-shop implementation log and this plan's Outcome (closing DAST-M5, so open items return to 0);
   and a portfolio PR updating Learning Paths stage 4.4 and finding 7, with a new walkthrough.

## Verification

- `npm run verify` passes. The empty-environment spawn test must fail against the old code (it would hit `EINVAL`); confirm by running it
  against a copy of the old `npm.cmd` approach, or by reasoning recorded in the log if that is not practical.
- `npm run scan:repeatability` on Windows either passes (three identical fresh-container gating class sets) or fails with a recorded cause.
- The CI dispatch on the branch passes, so Linux behaviour is unchanged.
- `git diff` shows only: the new module and its `.d.mts`, the probe, the new test, `docs/backlog.md`, and the plan and template files.

## Delivery

Branch `chore/dast-m5-windows-safe-repeatability-probe`; one PR against `main`. The owner merges. After merge: the implementation log
and this plan's Outcome in a juice-shop PR, and the stage 4.4 and finding 7 update in the portfolio repository.

**Out of scope:** loan-origination's `build-reports.mjs` (backlog Risk #3 there), the registry and landing page, and any change to the DAST
contract, container pins or scan behaviour.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Fix shape | A: `npm_execpath` with a fallback. B: `shell: true` only. C: run `scan` and `scan:verdict` directly, bypassing npm | A: same on both operating systems, no warning in the normal path; B prints a DEP0190 warning every run and concatenates arguments; C duplicates the `dast` composition and can drift from `package.json` | A, approved 2026-10-07 |
| Lifecycle | Leave the registry and landing page as "resting, Closed 2026-09-10"; or refresh the label date | Leave them: the item opens and closes in one cycle, and the landing page's parity guards make extra edits costly | Leave them, approved 2026-10-07 |
| Verification | Local Windows scans plus a CI dispatch on the branch; or local only | Both: the dispatch is the only proof that Linux is unchanged | Both, approved 2026-10-07 |
| Delegation | Do it directly; or a subagent as for PB-PIN-06 | Directly: the code and tests are small, and the long scan runs in the background with a memory check | Directly, approved 2026-10-07 |
