# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1410Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_juice-shop-dast-automation.md)

**Reviewer:** AI assistant (Gemini)
**Date:** 2026-08-07T14:10Z

---

## Risk Ranking Table

| ID | Severity | Summary | Location |
| --- | --- | --- | --- |
| R-01 | Medium | Host port collision risk during BDD execution | [`scripts/run-bdd.mjs`](scripts/run-bdd.mjs) (line 16) |
| R-02 | Medium | Duplicated container lifecycle & readiness polling | [`scripts/run-scan.mjs`](scripts/run-scan.mjs) & [`scripts/run-bdd.mjs`](scripts/run-bdd.mjs) |
| R-03 | Low | String-key coupling in Screenplay `Actor.notes` | [`src/screenplay/exploits.ts`](src/screenplay/exploits.ts) (line 33, 79) |
| R-04 | Low | Unused interface field definitions in findings model | [`src/findings/zap-report.ts`](src/findings/zap-report.ts) (lines 13-15) |
| R-05 | Info | Pending Phase 5 project onboarding in root registry | [`docs/backlog.md`](docs/backlog.md) (line 87) |

---

## Detailed Risk Assessments

### Risk R-01: Host Port Collision Risk During BDD Execution

- **Risk Description:** `scripts/run-bdd.mjs` binds the target container to fixed host port `3000` (`-p 3000:3000`). If host port 3000 is occupied by another process or concurrent CI job, container startup fails.
- **Evidence:**
  ```javascript
  // scripts/run-bdd.mjs (line 16, 42)
  const PORT = 3000;
  execFileSync('docker', ['run', '-d', '--name', CONTAINER, '-p', `${PORT}:${PORT}`, JUICE_SHOP_IMAGE]);
  ```
- **Impact Analysis:** Intermittent build or local test failures on developer machines or shared runners where port 3000 is already bound.
- **Refactor Recommendation:** Read host port from an environment variable `JUICE_SHOP_PORT` with default fallback, or use dynamic host port mapping (`-p 0:3000`) and inspect assigned port via `docker port`.

---

### Risk R-02: Duplicated Container Lifecycle & Readiness Polling

- **Risk Description:** Both `run-scan.mjs` and `run-bdd.mjs` implement near-identical logic for stopping existing containers, running Docker images, and polling HTTP readiness (`waitForReady`).
- **Evidence:**
  - [`scripts/run-scan.mjs`](scripts/run-scan.mjs) (lines 41-53)
  - [`scripts/run-bdd.mjs`](scripts/run-bdd.mjs) (lines 25-36)
- **Impact Analysis:** Maintenance drift when updating timeouts, health check endpoints, or Docker container flags across scan and BDD runners.
- **Refactor Recommendation:** Extract container lifecycle management into a shared helper module `scripts/docker-utils.mjs`.

---

### Risk R-03: String-Key Coupling in Screenplay `Actor.notes`

- **Risk Description:** `LogInBySqlInjection` task stores authentication token under magic string `'token'`, which `readBasket` retrieves via `actor.recall<string>('token')`.
- **Evidence:**
  ```typescript
  // src/screenplay/exploits.ts (line 33, 79)
  if (token) actor.remember('token', token);
  // ...
  const token = actor.recall<string>('token');
  ```
- **Impact Analysis:** Runtime exception (`Mallory has no note named 'token'`) if a task attempting to read a basket is executed without prior execution of `LogInBySqlInjection`.
- **Refactor Recommendation:** Encapsulate session tokens within the `CallJuiceShop` ability directly (e.g. `api.setAuthToken(token)`), eliminating raw string keys in scenario memory.

---

### Risk R-04: Unused Interface Field Definitions in Findings Model

- **Risk Description:** `RawInstance` interface defines `uri?: string` in `zap-report.ts`, but instance objects are completely ignored by `normalise()`.
- **Evidence:**
  ```typescript
  // src/findings/zap-report.ts (lines 13-15)
  interface RawInstance {
    uri?: string;
  }
  ```
- **Impact Analysis:** Minor code noise and ambiguity regarding whether alert URIs are intended to be processed or validated.
- **Refactor Recommendation:** Remove `RawInstance` or add JSDoc comment explaining its inclusion for raw JSON documentation.

---

### Risk R-05: Pending Phase 5 Project Onboarding in Portfolio Registry

- **Risk Description:** The repository is fully functional but Phase 5 of [`docs/backlog.md`](docs/backlog.md) is unticked, and the project is not yet listed in the portfolio root `README.md`.
- **Evidence:** [`docs/backlog.md`](docs/backlog.md) (lines 87-89).
- **Impact Analysis:** Portfolio visibility gap; automated workspace preflight scripts will skip or warn on unregistered repository status.
- **Refactor Recommendation:** Complete Phase 5 items: update root `README.md` project table, publish `session-notes/` handover v1, and close out backlog.

---

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1410Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_juice-shop-dast-automation.md)
```

---