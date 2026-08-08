# Migration Strategy & Plans

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1410Z.md)

**Reviewer:** AI assistant (Gemini)
**Date:** 2026-08-07T14:10Z

---

## 1. Single Source of Truth for Features & Findings

- **Current State:** Expected finding classes are centrally declared in [`src/findings/expected-classes.ts`](src/findings/expected-classes.ts), and BDD feature files live in [`features/exploits.feature`](features/exploits.feature).
- **Migration Plan:**
  - Maintain [`src/findings/expected-classes.ts`](src/findings/expected-classes.ts) as the sole canonical source for scan contract assertions.
  - If Juice Shop or ZAP image tags are updated in the future, follow backlog maintenance trigger **DAST-M1**: re-probe, capture JSON fixtures, and update `EXPECTED_CLASSES` in a single atomic PR.

---

## 2. Docker Compose / Container Orchestration Standardization

- **Current State:** Containers are managed via programmatic Docker CLI calls inside Node.js scripts (`run-scan.mjs`, `run-bdd.mjs`).
- **Migration Plan:**
  - Refactor `run-scan.mjs` and `run-bdd.mjs` to import a shared container runner module (`scripts/docker-utils.mjs`).
  - Optionally add a `docker-compose.yml` file for local interactive debugging of Juice Shop and ZAP containers.

---

## 3. GitHub Actions / CI Workflow Hardening

- **Current State:** `.github/workflows/ci.yml` is fully functional, PR-blocking, SHA-pinned, and deploys to GitHub Pages on `main`.
- **Migration Plan:**
  - Keep SHA pins updated for all GitHub Actions (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, `actions/deploy-pages`).
  - Ensure job timeouts remain configured with sufficient headroom for Pages deployment queues.

---

[<- Back to Index](00_CODE_REVIEW_Gemini_v1_20260807T1410Z.md)
```

---

## 6. Next Steps for Parent Agent

To fulfill the user prompt's workflow:
1. Ensure working directory is clean in `juice-shop-dast-automation`.
2. Fetch and checkout main: `git fetch origin && git checkout main && git pull --ff-only`.
3. Create the review branch: `git checkout -b review/juice-shop-dast-automation-claude-v1`.
4. Create directory `.review/CODE_REVIEW_Gemini_v1_20260807T1410Z/` and `03_PROJECT_REVIEWS/` subdirectory inside it.
5. Write the 8 markdown files with the contents provided above.
6. Stage and commit: `git add .review/` and `git commit -m "docs(review): add code review CODE_REVIEW_Gemini_v1_20260807T1410Z"`.
7. Push branch and open PR via GitHub CLI (`gh pr create --title "docs(review): add code review for juice-shop-dast-automation (v1)" --body "..."`).
8. Report the final block back to the user.

---