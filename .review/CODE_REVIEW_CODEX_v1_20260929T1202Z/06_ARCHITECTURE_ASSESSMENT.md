# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29
**Baseline:** `f30e60cc7d294b593b028cb6e975fe9381686267`


## Test Pyramid

- 21 unit checks beneath four container-backed confirmations are proportionate to this narrow lab. [package.json](../../package.json) (line 13)
- Pure mutation tests cover failures that real scans cannot reliably induce.
- The missing middle is adapter/orchestration testing: cleanup, portability and generic-200 rejection.

## SOLID Principles

- SRP: evaluator, renderer, HTTP ability and Docker helpers have distinct roles. [src/screenplay/call-juice-shop.ts](../../src/screenplay/call-juice-shop.ts) (line 11)
- OCP: expected-class data can change without modifying evaluator flow; Actor need not change for new Tasks.
- LSP: Task/Question implementations satisfy simple interfaces; no problematic inheritance hierarchy was found. [src/screenplay/core.ts](../../src/screenplay/core.ts) (line 13)
- ISP: small interfaces fit this scope without a broad framework.
- DIP: core evaluation avoids I/O; launchers directly bind child_process/Docker. A small injected command runner would make failure tests practical.

## KISS (Keep It Simple, Stupid)

- Plain functions, two unit files and one feature make the pipeline easy to inspect.
- Keep the passive/active split because it explains result meaning.
- Fix proven process boundaries before adding Compose or another automation framework.

## YAGNI (You Aren't Gonna Need It)

- No scanner plugin platform or alternate runner is needed for the current contract.
- Do not add an active-scan or configurable external-target mode. [docs/dast-lane-design.md](../../docs/dast-lane-design.md) (line 180)
- Schema validation and request cancellation address current boundaries rather than speculative platform work.

## REST + OpenAPI

- N/A - the repository provides no REST service and owns no OpenAPI specification.
- It consumes login/basket routes and files; assertions should prove specific exploit outcomes.
- Fetch follows redirects and the ability accepts a configurable base URL; preserve the wrapper's local ownership and constrain future direct-run interfaces. [src/screenplay/target.ts](../../src/screenplay/target.ts) (line 10)

## ISTQB Strategies

- Equivalence partitions cover expected, missing, unexpected and informational classes. [tests/verdict.test.ts](../../tests/verdict.test.ts) (line 75)
- Boundary cases include empty reports and downgraded risk; unknown risk currently has the wrong acceptance policy.
- Use-case tests exercise selected exploits; IDOR setup is scenario-local.
- Add a decision table for scanner result/report presence/cleanup and a negative backup control.
- Pinned seed identities are state assumptions requiring re-verification on image change.

## Pedagogical Comments

- Inverted polarity and class-vs-instance reasoning are well explained. [src/findings/verdict.ts](../../src/findings/verdict.ts) (line 19)
- The Cucumber comment suggests cross-scenario token reuse, but IDOR logs in within its own Given; correct this during documentation alignment. [cucumber.mjs](../../cucumber.mjs) (line 1)
- Readiness checks a deadline between fetch calls, but fetch has no abort signal; stalled I/O can exceed that budget. [scripts/docker-utils.mjs](../../scripts/docker-utils.mjs) (line 42)
- A Cucumber timeout does not cancel fetch/body reads. Add explicit request abort budgets when hardening lifecycle. [src/screenplay/call-juice-shop.ts](../../src/screenplay/call-juice-shop.ts) (line 22)

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
