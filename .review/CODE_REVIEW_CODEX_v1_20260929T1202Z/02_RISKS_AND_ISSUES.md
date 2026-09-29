# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Project Review: Juice Shop DAST Automation ->](03_PROJECT_REVIEWS/PROJECT_001_JUICE_SHOP_DAST_AUTOMATION.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29
**Baseline:** `f30e60cc7d294b593b028cb6e975fe9381686267`

## Risk Register

Severity is scoped to this educational local automation repository. No critical issue or real-product security assessment is claimed.

## JSD-01 - HIGH - Bind the intentionally vulnerable target to loopback

**Risk Description/Explanation:** The scan and BDD launchers publish ports without a host IP. Default Docker publication can expose the deliberately vulnerable application on host interfaces, beyond the local-only intent. Actual reachability depends on daemon configuration, firewall and network; it was not tested.

**Evidence Outline:** [scripts/run-scan.mjs](../../scripts/run-scan.mjs) (line 49); [scripts/run-bdd.mjs](../../scripts/run-bdd.mjs) (line 30); [docs/dast-lane-design.md](../../docs/dast-lane-design.md) (line 178).

**Impact Analysis:** A developer using the documented commands can unintentionally expose the training target to another machine. This is local environment exposure, not a finding against a real product.

**Refactor Recommendation and Strategy:** Publish 127.0.0.1:PORT:3000 for host-side readiness/BDD, or eliminate host publication for the scan and probe readiness internally. Test Docker arguments and inspect HostIp during a later authorised run; retain the fixed scanner target.

## JSD-02 - MEDIUM - Missing reports bypass teardown

**Risk Description/Explanation:** The missing-report branch calls process.exit(1) inside try. Immediate process termination bypasses the finally block that removes the target and network.

**Evidence Outline:** [scripts/run-scan.mjs](../../scripts/run-scan.mjs) (line 81); [scripts/run-scan.mjs](../../scripts/run-scan.mjs) (line 86); [scripts/run-scan.mjs](../../scripts/run-scan.mjs) (line 89).

**Impact Analysis:** A scanner start/write failure can leave the vulnerable target running on a long-lived developer host, compounding JSD-01. Ephemeral hosted runners limit persistence.

**Refactor Recommendation and Strategy:** Throw an error or retain a failure result, execute teardown in finally, then exit. Simulate missing JSON and missing HTML through a mocked command/filesystem boundary; assert cleanup and non-zero exit.

## JSD-03 - MEDIUM - Windows repeatability launcher cannot start npm.cmd

**Risk Description/Explanation:** The Windows branch selects npm.cmd and passes it to spawnSync without a shell. An isolated --version reproduction on this Windows host returned EINVAL before any command ran.

**Evidence Outline:** [scripts/run-repeatability-probe.mjs](../../scripts/run-repeatability-probe.mjs) (line 15); [scripts/run-repeatability-probe.mjs](../../scripts/run-repeatability-probe.mjs) (line 36).

**Impact Analysis:** The documented repeatability command cannot begin its first scan on this host. Linux CI is not affected by the demonstrated Windows-specific failure.

**Refactor Recommendation and Strategy:** Invoke a resolved npm JavaScript CLI through process.execPath or use a reviewed platform launcher. Check the process boundary with --version on Windows/Linux before authorising any container execution.

## JSD-04 - MEDIUM - Unrecognised report values evade the new-class guard

**Risk Description/Explanation:** Unknown risk labels become Informational and incomplete alerts are discarded. Adding an unreviewed alert with riskdesc Bogus (High) to the passing fixture still returns pass=true. Existing tests explicitly encode this behaviour.

**Evidence Outline:** [src/findings/zap-report.ts](../../src/findings/zap-report.ts) (line 50); [src/findings/zap-report.ts](../../src/findings/zap-report.ts) (line 64); [tests/verdict.test.ts](../../tests/verdict.test.ts) (line 32).

**Impact Analysis:** Malformed or changed report data can contain an unreviewed class while the gate claims nothing unexpected appeared. Digest pins reduce drift but do not justify silent acceptance of invalid input.

**Refactor Recommendation and Strategy:** Validate consumed fields at the boundary; distinguish recognised Informational from missing/unknown risks. Fail with schema diagnostics for malformed alerts while retaining ordinary Informational non-gating behaviour. Add mutated fixture tests.

## JSD-05 - MEDIUM - Failure paths lose raw diagnostic artefacts

**Risk Description/Explanation:** The report upload uses the default success condition after verdict and BDD. A missing-class or BDD failure skips upload even when reports exist. The repeatability workflow emits its summary only after success and does not upload individual run reports.

**Evidence Outline:** [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (line 49); [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (line 55); [.github/workflows/dast-repeatability.yml](../../.github/workflows/dast-repeatability.yml) (line 23).

**Impact Analysis:** Failures that need crawl/resource evidence can leave only console logs when the runner is discarded. DAST-M3 history demonstrates the value of individual reports.

**Refactor Recommendation and Strategy:** Upload available diagnostics after failures with explicit missing-file handling; retain success-only Pages publication. Preserve each completed repeatability iteration and upload partial evidence if a later iteration fails. Assess standing DAST-M2 when editing the upload step.

## JSD-06 - MEDIUM - Backup bypass proves only HTTP status

**Risk Description/Explanation:** The poison-null-byte scenario asserts HTTP 200 without checking backup contents. The adjacent confidential-document scenario already checks a content marker.

**Evidence Outline:** [features/exploits.feature](../../features/exploits.feature) (line 23); [features/steps/exploit.steps.ts](../../features/steps/exploit.steps.ts) (line 37); [features/steps/exploit.steps.ts](../../features/steps/exploit.steps.ts) (line 41).

**Impact Analysis:** A fallback HTML page or generic 200 response can pass without disclosing a backup. The confirmed-bypass claim is stronger than the assertion.

**Refactor Recommendation and Strategy:** Choose a stable backup-specific content marker from an authorised pinned-target observation, and assert a control request without the bypass is denied. Verify a generic 200 body cannot satisfy the assertion.

## JSD-07 - LOW - The typecheck omits executable BDD glue and verdict CLI

**Risk Description/Explanation:** The include list covers src and tests. build-pages is checked transitively through tests, but features/support, features/steps and scripts/check-findings.ts are not programme roots or imported by those roots. tsx and Cucumber dry-run do not replace typechecking.

**Evidence Outline:** [tsconfig.json](../../tsconfig.json) (line 19); [package.json](../../package.json) (line 11); [features/steps/exploit.steps.ts](../../features/steps/exploit.steps.ts) (line 21).

**Impact Analysis:** Type errors in executed step glue or the verdict CLI can survive the fast gate.

**Refactor Recommendation and Strategy:** Include features/**/*.ts and scripts/**/*.ts with noEmit, inspect the effective programme file list, and validate the expanded gate.

## JSD-08 - LOW - Binding design retains pre-delivery and inaccurate operational claims

**Risk Description/Explanation:** The binding design says SQLi is unverified and phases 2-5 are planned, while backlog v12 closes them. It also claims committed reports, same-container BDD and lint in verify, contrary to current scripts and ignores.

**Evidence Outline:** [docs/dast-lane-design.md](../../docs/dast-lane-design.md) (line 166); [docs/dast-lane-design.md](../../docs/dast-lane-design.md) (line 195); [docs/dast-lane-design.md](../../docs/dast-lane-design.md) (line 207); [docs/dast-lane-design.md](../../docs/dast-lane-design.md) (line 216); [docs/dast-lane-design.md](../../docs/dast-lane-design.md) (line 242); [docs/backlog.md](../../docs/backlog.md) (line 13).

**Impact Analysis:** A cold reader cannot determine which binding operational promises remain current. The backlog remains authoritative; historical logs are not wrong merely because later work superseded them.

**Refactor Recommendation and Strategy:** Add a versioned current-state design amendment preserving original decision provenance. State separate containers, ignored generated reports, exact gate and implemented scenario selection. Narrow the verdict formatter's SQLi/XSS claim because the suite has no XSS scenario.

## JSD-09 - LOW - Node support exceeds the locked runner's range

**Risk Description/Explanation:** Root engines allow Node >=20, but locked Cucumber 13.2.1 requires 22 || 24 || >=26. README and CI already use Node 24.

**Evidence Outline:** [package.json](../../package.json) (line 8); [package-lock.json](../../package-lock.json) (line 108); [README.md](../../README.md) (line 25); [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (line 26).

**Impact Analysis:** An installation on an advertised Node version can warn or fail in the BDD runner. Older runtimes were not executed; this incompatibility comes from explicit locked metadata.

**Refactor Recommendation and Strategy:** Align root engines and lock metadata to the tested supported baseline, preferably Node 24. Broaden runtime support only with evidence.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Project Review: Juice Shop DAST Automation ->](03_PROJECT_REVIEWS/PROJECT_001_JUICE_SHOP_DAST_AUTOMATION.md)
