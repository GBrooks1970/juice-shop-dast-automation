# DAST-M4 Dependency Remediation & Lifecycle Closure — 2026-09-10

## Session Summary

The goal was to remediate the dev-only transitive `nanoid <3.3.18` advisory (GHSA-2v37-7h3g-55p8) and accompanying `@vitest/mocker` advisory (GHSA-82fw-gwwq-j7x9) without broad dependency churn, verify that the typecheck, unit tests, and BDD verification remain green, achieve zero vulnerabilities on `npm audit`, update the project backlog to version 12 (closed), and transition the project lifecycle to `resting`.

---

## Objectives

1. ✅ Constrain the dev-only transitive `nanoid` dependency to `^3.3.18` via npm `overrides` in `package.json`.
2. ✅ Update `vitest` devDependency to `^4.1.11` to resolve `@vitest/mocker@4.1.11`.
3. ✅ Regenerate `package-lock.json` and prove `npm audit` reports zero vulnerabilities.
4. ✅ Keep `npm run verify` (typecheck + 21 unit tests) and `npm run bdd:dry` green.
5. ✅ Reconcile `docs/backlog.md` to version 12, mark `DAST-M4` closed, and transition lifecycle to `resting`.

---

## Test Results

| Gate | Suite | Before | After | Status |
|---|---|---|---|---|
| `npm audit` | Vulnerability audit | 3 vulnerabilities (1 High, 2 Moderate) | `found 0 vulnerabilities` | ✅ PASS |
| `npm run verify` | TypeScript + Vitest | 21/21 passed | 21/21 passed (724ms) | ✅ PASS |
| `npm run bdd:dry` | Cucumber step bindings | 4 scenarios / 11 steps bound | 4 scenarios / 11 steps bound | ✅ PASS |
| PR #9 CI | PR-blocking verification & DAST scan | N/A | Run `34533178525` passed (Verify 14s, Scan 2m33s) | ✅ PASS |
| Exact-merge CI | Default-branch verification & Pages deploy | Baseline `0fa0119` | Run `34533883406` passed on `2a48cd9` (Verify 13s, Scan 2m14s, Deploy 31s) | ✅ PASS |
| Live Pages report | HTTP probe | HTTP 200 OK | HTTP 200 OK (`2026-09-11T06:11:44Z`) | ✅ PASS |

Evidence:

- [PR #9](https://github.com/GBrooks1970/juice-shop-dast-automation/pull/9) merged as
  `2a48cd92b23c21a117282cb927bbbb19eb38c92a`.
- [PR run 34533178525](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34533178525)
  passed all checks without rerun: Verify (14s) and Scan + confirm (2m33s).
- [Exact-merge run 34533883406](https://github.com/GBrooks1970/juice-shop-dast-automation/actions/runs/34533883406)
  passed on `main`, deploying the labelled Pages site to <https://gbrooks1970.github.io/juice-shop-dast-automation/>.
- Live probe to <https://gbrooks1970.github.io/juice-shop-dast-automation/> returned HTTP 200 OK.

---

## Changes Implemented

### Constrain transitive nanoid and bump Vitest patch

**Files changed:**

- `package.json` — added `"overrides": { "nanoid": "^3.3.18" }` and bumped `"vitest": "^4.1.11"`.
- `package-lock.json` — resolved `nanoid@3.3.19` under `vite@8.3.0` -> `postcss@8.5.28`, and resolved `@vitest/mocker@4.1.11` under `vitest@4.1.11`.
- `docs/backlog.md` — updated version to 12; marked DAST-M4 closed; updated lifecycle table to 0 open items (resting).

---

## Backlog & Lifecycle Reconciliations

With DAST-M4 closed:
- **Outstanding backlog items:** 0 (0 High, 0 Medium, 0 Low).
- **Lifecycle status:** `resting`.
- **Standing triggers / mitigations:** R1/R2 remain standing mitigations; DAST-M1/M2 remain dormant conditional triggers.
