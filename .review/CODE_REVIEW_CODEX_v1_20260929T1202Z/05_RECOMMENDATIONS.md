# Recommendations

[<- Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29
**Baseline:** `f30e60cc7d294b593b028cb6e975fe9381686267`


## Recommended Refactors

- First JSD-01/JSD-02: loopback binding and guaranteed cleanup, validated through Docker arguments and simulated missing-report failure.
- Then JSD-03/JSD-05: portable launch and failed-run evidence. Assess DAST-M2 when touching upload-artifact.
- Then JSD-04/JSD-06: report validation and backup-specific content plus a negative control.
- Finally JSD-07/JSD-08/JSD-09: complete TypeScript roots, a versioned design amendment and accurate Node support.

## Next Steps

- Triage nine candidates against backlog v12; review does not silently change the resting lifecycle.
- Deliver small changes in dependency order and retain existing pure tests.
- Use an authorised container run after lightweight failure-path checks; preserve E:\_DockerData storage and fixed target scope.
- Record fresh Windows launch evidence and, for scanner configuration changes, three independent scans plus live BDD.

## Future Project Ideas

- Add a bounded report-schema adapter with adversarial fixtures in the existing pure-test lane.
- Introduce run-scoped resource names only if concurrent local use is needed; meanwhile document exclusive invocation.
- Consider a run manifest binding timestamps and image digests to published evidence without adding external-target capability.

---

[<- Previous: Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
