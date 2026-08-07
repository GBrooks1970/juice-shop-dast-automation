# Code Review Index: juice-shop-dast-automation

**Reviewer:** AI assistant (Claude 3.7 Sonnet)
**Date:** 2026-08-07T14:10Z
**Scope:** Full repository code review of juice-shop-dast-automation
**Target System:** OWASP Juice Shop v20.1.1 (intentionally vulnerable target) & OWASP ZAP v2.17.0

---

## Overview

This directory contains the comprehensive code review for **`juice-shop-dast-automation`**, evaluated by a Senior Test Automation Architect against portfolio standards, design contracts ([`docs/dast-lane-design.md`](docs/dast-lane-design.md)), and project backlog status ([`docs/backlog.md`](docs/backlog.md)).

---

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
   - High-level overview of design, code quality, key strengths, and pedagogical value.
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
   - Prioritised list of technical risks, impact analysis, evidence, and remediation strategies.
3. [Project Review](03_PROJECT_REVIEWS/PROJECT_001_juice-shop-dast-automation.md)
   - Deep-dive single-repository assessment covering architecture, pattern fidelity, BDD, and CI.
4. [Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md)
   - Cross-layer analysis across scan automation, findings model, BDD Screenplay layer, CI workflow, and docs.
5. [Recommendations](05_RECOMMENDATIONS.md)
   - Actionable near-term refactor suggestions, immediate next steps, and future project enhancements.
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
   - Evaluation against Test Pyramid, SOLID, KISS, YAGNI, REST standards, and ISTQB strategies.
7. [Migration Plans](07_MIGRATION_PLANS.md)
   - Structured guidance for Docker compose setup, single source of truth, and CI/CD workflow hardening.

---

## Structure Summary

The repository delivers an automated Dynamic Application Security Testing (DAST) pipeline with two complementary halves:
1. **ZAP Passive Baseline Scan:** Scans the pinned OWASP Juice Shop container and evaluates a positive-detection verdict using a pure TypeScript model (`src/findings/`).
2. **BDD Confirmation Scenarios:** Executes hand-rolled Screenplay HTTP scenarios via `@cucumber/cucumber` to actively exploit documented vulnerabilities (SQLi login bypass, FTP document exposure, IDOR basket reading).

The codebase is clean, well-tested, and demonstrates high architectural discipline with clear safety constraints.

---

## Key Findings

1. **Host Port Collision Risk in BDD Script:** [`scripts/run-bdd.mjs`](scripts/run-bdd.mjs) (line 16) hardcodes host port `3000`, creating potential port contention during parallel CI runs or local execution.
2. **Script Code Duplication:** Container startup and readiness polling logic are duplicated between [`scripts/run-scan.mjs`](scripts/run-scan.mjs) (lines 41-53) and [`scripts/run-bdd.mjs`](scripts/run-bdd.mjs) (lines 25-36).
3. **Screenplay Note Key Coupling:** Exploit tasks rely on un-typed string keys in `Actor.notes` (`'token'`, `'last-response'`), introducing minor scenario-order fragility.
4. **Phase 5 Portfolio Onboarding Pending:** Backlog Phase 5 remains open, awaiting final registration in root `README.md`.

---

## Navigation Guide

- To review executive summary and high-level scoring, read [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md).
- To inspect specific file findings with line numbers and refactor code, read [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md).
- To examine architecture and SOLID compliance, read [06_ARCHITECTURE_ASSESSMENT.md](06_ARCHITECTURE_ASSESSMENT.md).

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
```

---