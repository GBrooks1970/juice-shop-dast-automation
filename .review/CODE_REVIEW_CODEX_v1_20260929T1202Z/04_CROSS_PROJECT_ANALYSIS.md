# Cross-Cutting Analysis

[<- Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29
**Baseline:** `f30e60cc7d294b593b028cb6e975fe9381686267`


## Tool-Agnostic Tests

- Gherkin describes exploit outcomes independently of HTTP mechanics. [features/exploits.feature](../../features/exploits.feature) (line 9)
- Execution is tied to Cucumber and the custom Screenplay API; no runner parity is promised.
- The pure JSON evaluator can be called from another harness without changing containers.

## Code-Agnostic Tests

- HTTP requests observe the deployed container without importing target internals. [src/screenplay/call-juice-shop.ts](../../src/screenplay/call-juice-shop.ts) (line 22)
- Paths, seed users and response fields remain version-specific.
- Image bumps require scenario re-verification; language independence does not imply version independence.

## Single Source of Truth

- Backlog v12 owns lifecycle; expected-classes owns seven gating tuples. [src/findings/expected-classes.ts](../../src/findings/expected-classes.ts) (line 35)
- Image pins repeat in metadata and launcher constants; an equality check would catch drift.
- Repeatability duplicates normalisation; share the validated boundary after JSD-04. [scripts/run-repeatability-probe.mjs](../../scripts/run-repeatability-probe.mjs) (line 17)

## API Contract Compliance

- The suite consumes Juice Shop routes without an OpenAPI document. [src/screenplay/exploits.ts](../../src/screenplay/exploits.ts) (line 29)
- Selected statuses, content and JSON fields are checked; this is behavioural confirmation, not comprehensive schema conformance.
- Add only response contracts needed to substantiate exploit claims; a successful exploit does not prove REST compliance.

## Screenplay Parity

- One Screenplay implementation exists; cross-language parity is N/A.
- Tasks act, Questions inspect captured responses, and step glue asserts results. [src/screenplay/core.ts](../../src/screenplay/core.ts) (line 13)
- MemoryKey centralises labels but recall<T> remains an unchecked cast; it is not a key-to-value type schema. [src/screenplay/core.ts](../../src/screenplay/core.ts) (line 57)

## Batch File Design

- N/A - no batch suite exists; Node launchers are the equivalent operational surface.
- The Windows npm.cmd boundary fails before Docker starts (JSD-03).
- Docker argument arrays avoid shell interpolation. [scripts/docker-utils.mjs](../../scripts/docker-utils.mjs) (line 11)

## Documentation Alignment

- README and backlog correctly identify four current scenarios. [README.md](../../README.md) (line 18)
- The design's candidates, report retention and lint claims drift (JSD-08).
- Historical logs should remain immutable; record a current-state amendment rather than rewriting past results.

## Logging Alignment

- Verdict output identifies missing/unexpected classes and states scope. [src/findings/verdict.ts](../../src/findings/verdict.ts) (line 53)
- The formatter says SQLi/XSS are proven by BDD although no XSS scenario exists; narrow this during JSD-08. [src/findings/verdict.ts](../../src/findings/verdict.ts) (line 75)
- Failure paths lack raw artefacts and repeatability summary is success-only (JSD-05).

## Test Coverage Metrics

- Observed: 2 unit files, 21 passing tests, 4 dry-run scenarios, 11 bound steps.
- Seven classes are compared by plugin/name/risk rather than instance count. [src/findings/expected-classes.ts](../../src/findings/expected-classes.ts) (line 35)
- No branch/statement coverage report was generated; counts are not percentage coverage.
- The two unit files do not directly test lifecycle helpers, process portability or request cancellation.

---

[<- Previous: Project Review: Juice Shop DAST Automation](03_PROJECT_REVIEWS/PROJECT_001_JUICE_SHOP_DAST_AUTOMATION.md) | [Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
