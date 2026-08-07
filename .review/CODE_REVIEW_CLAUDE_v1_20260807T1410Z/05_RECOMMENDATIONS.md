# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_v1_20260807T1410Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (Claude 3.7 Sonnet)
**Date:** 2026-08-07T14:10Z

---

## Recommended Refactorings

### 1. Extract Shared Docker Helper Module
- **Priority:** High
- **Target Files:** [`scripts/run-scan.mjs`](scripts/run-scan.mjs), [`scripts/run-bdd.mjs`](scripts/run-bdd.mjs)
- **Description:** Consolidate container teardown, execution, and health check polling into `scripts/docker-utils.mjs`.
- **Benefit:** Eliminates code duplication and ensures uniform timeout and error handling across scan and BDD workflows.

### 2. Make BDD Host Port Configurable
- **Priority:** Medium
- **Target File:** [`scripts/run-bdd.mjs`](scripts/run-bdd.mjs)
- **Description:** Allow host port override via `process.env.JUICE_SHOP_PORT` instead of hardcoding port `3000`.
- **Benefit:** Prevents host port collisions during parallel test execution or local development.

### 3. Strongly Type Screenplay Actor Notes
- **Priority:** Medium
- **Target Files:** [`src/screenplay/core.ts`](src/screenplay/core.ts), [`src/screenplay/exploits.ts`](src/screenplay/exploits.ts)
- **Description:** Replace loose string keys in `Actor.remember()` with typed session state methods on `CallJuiceShop` ability.
- **Benefit:** Prevents runtime errors caused by missing notes and improves IDE autocomplete.

---

## Next Steps (Immediate Actions)

1. **Complete Phase 5 Portfolio Onboarding:**
   - Register `juice-shop-dast-automation` in portfolio root `README.md`.
   - Create initial handover notes in `session-notes/juice-shop-dast-automation_session-notes_v1_*.md`.
   - Mark Phase 5 items complete in [`docs/backlog.md`](docs/backlog.md).
2. **Apply Script Refactoring:** Extract `docker-utils.mjs` helper module.
3. **Verify CI Execution:** Run `npm run verify` and push branch to verify GitHub Actions workflow.

---

## Future Project Ideas

1. **Additional BDD Exploit Scenarios:** Expand BDD scenarios to cover DOM-based XSS or OAuth2 misconfigurations if Juice Shop pins are updated.
2. **ZAP Active Scanning Profile (Nightly/Manual):** Introduce an optional, non-blocking active scan workflow for deep vulnerability probing.
3. **SARIF Export Support:** Convert ZAP report findings into SARIF format for native integration with GitHub Code Scanning alerts.

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_v1_20260807T1410Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
```

---