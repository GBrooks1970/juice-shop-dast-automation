# Evidence and Validation

[<- Back to Index](../00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Code Review: juice-shop-dast-automation ->](../00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29
**Baseline:** `f30e60cc7d294b593b028cb6e975fe9381686267`

## Baseline and Scope

- Reviewed SHA: `f30e60cc7d294b593b028cb6e975fe9381686267`, branch main, 2026-09-29 UTC.
- Initial git status --short was empty. Already-fetched origin/main equals HEAD; no remote refresh.
- Parent preflight reported stale handover v4. Backlog v12 is authoritative.
- Mapped with rg --files --hidden, excluding dependencies/generated output/old reviews. Read implementation, features, scripts, workflows, tests, manifest/configuration, README, complete backlog/design and both implementation logs. Fixtures were loaded by tests and the isolated mutation probe.
- Workspace AGENTS.md applies. No project AGENTS.md or project-contract.md exists. Registry has no path deviation and selects npm run verify.
- No Docker, live BDD, Pages build, remote CI/Pages check, branch switch, commit, push or implementation change.

## Captured Validation

| Command | Result | Interpretation |
| --- | --- | --- |
| npm run verify | Typecheck completed; 2 files / 21 tests passed; Vitest 1.12s | Docker-free gate passed |
| npm run bdd:dry | 1 hook skipped; 4 scenarios skipped; 11 steps skipped; 0m 0.49s | Bindings resolved; no exploits executed |
| npm audit --json | Total vulnerabilities 0; dependencies 186 | Dependency audit snapshot |
| npm outdated --json | Four direct entries; final shell exit 1 | Updates available, not a test failure |
| Safe npm.cmd spawn probe | status null, EINVAL | Windows process-start defect confirmed |
| Unknown-risk fixture mutation | pass=true | Malformed new class does not fail gate |
| Targeted secret-pattern inspection | No apparent credential value in inspected code/workflows | Not a Git-history secret scan |

Validation used Node v24.18.0 / npm 11.16.0 and existing node_modules. No fresh npm ci was run. The PowerShell sequence's final exit 1 belongs to npm outdated; individual earlier exit codes were not separately retained. Successful tool outputs above are the evidence, not a claim that the combined shell command exited zero. Evidence was gathered earlier on the same date before the usage interruption.

## Safe Reproductions

The command-start probe invoked no Docker operation:

```javascript
const { spawnSync } = require('node:child_process');
const r = spawnSync('npm.cmd', ['--version'], { encoding: 'utf8' });
console.log({ status: r.status, error: r.error?.code });
// Observed: { status: null, error: 'EINVAL' }
```

The evaluator probe imported the existing TypeScript evaluator through node --import tsx/esm, loaded the committed run1 JSON into memory and appended:

```javascript
report.site[0].alerts.push({
  pluginid: '99999', alert: 'Unreviewed', riskdesc: 'Bogus (High)'
});
console.log(evaluate(report).pass); // observed true
```

No fixture was modified. Missing-report cleanup and host publication findings use source/control-flow evidence; they were not reproduced with containers.

## Dependency, Security and Licence Pass

Lockfile version 3 matches root dependency declarations. The current audit reports no advisories; no CVE is alleged. The nanoid override and Vitest 4.1.11 align with DAST-M4 remediation. A fresh installation was not checked.

| Dependency | Installed | Wanted | Latest reported |
| --- | --- | --- | --- |
| @types/node | 24.13.3 | 24.19.0 | 26.6.3 |
| tsx | 4.23.9 | 4.23.15 | 4.23.15 |
| typescript | 5.9.3 | 5.9.3 | 7.0.2 |
| vitest | 4.1.11 | 4.1.11 | 5.0.2 |

These are npm registry observations at review time, not an instruction to upgrade majors. No abandonment was established. Root Node >=20 differs from the locked Cucumber range (JSD-09).

Licence inventory across 186 lockfile package entries: MIT 151; Apache-2.0 7; BSD-3-Clause 3; ISC 6; MPL-2.0 12; BlueOak-1.0.0 1; BSD-2-Clause 1; (MIT OR CC0-1.0) 3; CC-BY-3.0 1; CC0-1.0 1. No missing licence fields. Repository licence is MIT. This is an inventory, not a legal compatibility opinion. Image contents/licences were not independently audited.

[LICENSE](../../../LICENSE) (line 1); [package-lock.json](../../../package-lock.json) (line 3); [package.json](../../../package.json) (line 22); [README.md](../../../README.md) (line 72).

Docker uses argument arrays. The hard-coded SQL payload and dummy password are intentional training inputs. Tokens remain in scenario memory. The Pages index escapes text for element content; raw ZAP HTML is copied unchanged, delegating rendering safety to pinned ZAP. A direct raw-report link also bypasses the custom index banner; review that surface under standing R1.

## Unverified and Historical Evidence

Backlog and logs cite historical three-scan repeatability, live BDD, PR runs and Pages availability. These were read as provenance, not refreshed. No coverage percentage, successful current Docker cleanup, live exploit outcome or current hosted CI status is claimed. Canonical backlog reports zero outstanding items; this review does not automatically reopen them.

## Review Bundle Checks

Post-generation validation passed: 9 Markdown files, 126 local link targets and 70 source line references checked; zero errors. All files decode as ASCII, all required headings and navigation are present, and source line numbers are within file bounds. Git diff --check passed. Final status contains only this new untracked review directory; source code and backlog were left unchanged.

---

[<- Previous: Migration Plans](../07_MIGRATION_PLANS.md) | [Back to Index](../00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Code Review: juice-shop-dast-automation ->](../00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md)
