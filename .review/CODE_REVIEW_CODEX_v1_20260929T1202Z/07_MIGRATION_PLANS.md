# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Evidence and Validation ->](ANNEX/EVIDENCE.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29
**Baseline:** `f30e60cc7d294b593b028cb6e975fe9381686267`


## Single Source of Truth for Features

- Keep the single Gherkin feature; no feature consolidation is necessary.
- Add backup-specific content and control assertions without losing business-readable wording.
- Share validated normalisation between verdict and repeatability.
- Compare image metadata with launcher digests before accepting pin updates.
- Add a dated design amendment linking implemented scenario selection and backlog status while preserving history.

## Docker Compose for Local Development

- N/A - a Compose migration is unnecessary for this disposable-container design.
- Retain direct Docker execution and the fixed internal scan target.
- Constrain host bindings or move readiness internally (JSD-01).
- Guarantee teardown before exit and clarify resource ownership; fixed names do not isolate simultaneous runs.
- Use E:\_DockerData for any later authorised storage verification; no Docker operation was performed here.

## GitHub Actions/Workflow

- Keep verify before the container lane with npm ci and npm caching. [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (line 18)
- Retain SHA-pinned actions and image digests; npm caching is not image-layer caching.
- Preserve success-only Pages deployment and its isolated write/id-token permissions.
- Add failure-aware raw report and repeatability retention without changing verdict semantics.
- Review DAST-M2 upon editing the upload step; no current hosted warning was checked.
- Check the launcher on Windows then collect fresh pipeline evidence for the exact change. A workflow file alone does not prove branch protection.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CODEX_v1_20260929T1202Z.md) | [Next: Evidence and Validation ->](ANNEX/EVIDENCE.md)
