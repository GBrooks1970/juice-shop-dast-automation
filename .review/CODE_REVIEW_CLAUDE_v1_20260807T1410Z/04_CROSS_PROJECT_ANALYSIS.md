# Cross-Cutting Analysis

[<- Back to Index](00_CODE_REVIEW_CLAUDE_v1_20260807T1410Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (Claude 3.7 Sonnet)
**Date:** 2026-08-07T14:10Z

---

## Single-Repository Context Note

Per template guidelines for single-repository reviews, this document analyzes cross-layer integration within **`juice-shop-dast-automation`** (Scan Automation vs Findings Engine vs BDD Layer vs CI Pipeline vs Documentation).

---

## 1. Tool-Agnostic Tests

- **HTTP Engine Independence:** The Screenplay layer uses standard web `fetch` APIs encapsulated in [`src/screenplay/call-juice-shop.ts`](src/screenplay/call-juice-shop.ts).
- **Framework Portability:** Exploit tasks (`LogInBySqlInjection`, `readBasket`) are decoupled from Cucumber and could easily be reused in Vitest, Playwright, or Node scripts.

---

## 2. Code-Agnostic Tests

- **Declarative Gherkin Specifications:** Feature files ([`features/exploits.feature`](features/exploits.feature)) contain business-readable domain steps free of implementation syntax or CSS selectors.
- **Inverted Polarity Expressiveness:** Clearly documents that scenario success means exploit success.

---

## 3. Single Source of Truth

- **Vulnerability Baseline Contract:** Expected finding classes are defined in a single immutable file: [`src/findings/expected-classes.ts`](src/findings/expected-classes.ts).
- **Pinned Docker Container Digests:** Container image digests for ZAP and Juice Shop are centrally recorded in `PINS` and used by both scan scripts and documentation.

---

## 4. API Contract Compliance

- **Juice Shop REST API Alignment:** Exploit tasks comply with Juice Shop REST endpoints (`/rest/user/login`, `/ftp/*`, `/rest/basket/*`).
- **Standardized JSON Assertions:** Custom Screenplay questions parse standard JSON keys (`authentication.token`, `data.UserId`).

---

## 5. Screenplay Parity

- **House Idiom Consistency:** Screenplay core (`Actor`, `Ability`, `Task`, `Question`) matches the portfolio standard used in `parabank-bank-automation`.
- **Lightweight Implementation:** Eliminates heavy browser dependencies by restricting abilities to HTTP communication.

---

## 6. Batch File & Script Design

- **Cross-Platform Node/ESM Scripts:** Orchestration scripts use ESM Node.js (`run-scan.mjs`, `run-bdd.mjs`), ensuring compatibility across Linux, macOS, and Windows without bash/powershell scripts.
- **Duplication Scope:** Minor duplication exists in Docker container polling logic between `run-scan.mjs` and `run-bdd.mjs`.

---

## 7. Documentation Alignment

- **Backlog & SDD Sync:** [`docs/backlog.md`](docs/backlog.md) and [`docs/dast-lane-design.md`](docs/dast-lane-design.md) are perfectly synchronized regarding decisions D2.1a through D2.7a.
- **Framing Consistency:** Framing text in `scripts/build-pages.ts` matches `README.md` verbatim and is enforced by `tests/build-pages.test.ts`.

---

## 8. Logging & Diagnostic Alignment

- **Clear Console Verdict Output:** `formatVerdict()` in [`src/findings/verdict.ts`](src/findings/verdict.ts) produces human-readable diagnostic reports for CI logs.
- **Informational Band Isolation:** Non-gating Informational alerts are logged separately to prevent test flakiness while retaining diagnostic visibility.

---

## 9. Test Coverage Metrics

- **Unit Test Coverage:** 21 unit tests covering 100% of verdict evaluation branches, missing/unexpected class filters, and page rendering functions.
- **Exploit Confirmation Coverage:** 4 BDD scenarios verifying 3 key vulnerability categories (A01 Broken Access Control, A03 Injection, A05 Security Misconfiguration).

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_v1_20260807T1410Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
```

---