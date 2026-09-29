# Project Review: Juice Shop DAST Automation

[<- Back to Index](../00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29
**Baseline:** `f30e60cc7d294b593b028cb6e975fe9381686267`


## Project Assessment

- Architecture: pure findings evaluator, minimal Actor/Task/Question layer, HTTP ability and external Node lifecycle. This is a single project. [src/findings/verdict.ts](../../../src/findings/verdict.ts) (line 29)
- Maintainability: launchers share image constants, but version/digest metadata is repeated in expected-classes and should be compared on pin changes. [scripts/docker-utils.mjs](../../../scripts/docker-utils.mjs) (line 6)
- Coverage: 14 verdict tests and 7 rendering tests passed. Four Gherkin scenarios implement SQLi, confidential-file exposure, backup bypass and IDOR. No quarantined scenarios or unresolved bindings were found. [features/exploits.feature](../../../features/exploits.feature) (line 14)
- Lifecycle/isolation: Actor memory is fresh per scenario and IDOR logs in within its Given. The target database is fresh per BDD invocation and shared serially within it. Fixed container names and eager teardown make concurrent local invocations unsafe. [scripts/run-bdd.mjs](../../../scripts/run-bdd.mjs) (line 18)
- Data/auth: pinned seed identities, admin email and basket/user ID 2 are assumed. Token presence and returned umail are checked, not cryptographic validity or an independent authenticated request; the IDOR scenario subsequently uses its token. [src/screenplay/exploits.ts](../../../src/screenplay/exploits.ts) (line 41)
- Documentation: backlog v12 and maintenance logs explain delivery/repeatability history; binding design retains stale state (JSD-08). [docs/backlog.md](../../../docs/backlog.md) (line 13)
- Credibility: scope labelling and fixture provenance are strong. Current binding evidence is not live exploit proof; backup-content assertions and failure artefacts need repair.
## Deferred, Planned and Conditional Coverage

Backlog v12 has zero open delivery/maintenance items. DAST-M1 is a dormant pin-bump re-verification trigger. DAST-M2 is a dormant action-runtime trigger; a future edit to the upload step should assess it. R1/R2 remain standing controls. XSS was considered but not selected; IDOR implements the third class. There is no requirement to add active scanning, external targets or comprehensive challenge coverage. The design's planned wording is stale, not proof that delivered SQLi/IDOR code is absent.

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
