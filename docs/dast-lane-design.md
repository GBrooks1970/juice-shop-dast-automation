# DAST lane — design note

**Status:** v0.1 (binding). Written design-doc-first (SDD), before implementation.
**Date:** 2026-08-06.
**Upstream:** portfolio design + decisions in `PORTFOLIO_PERF_AND_DAST_LANES_DESIGN_2026-08-05.md`
(§2, decisions **D2.1a–D2.7a**), refined by the evidence in
`DAST_PHASE0_FEASIBILITY_PROBE_2026-08-06.md` (Phase 0).

---

## 1. What this project is — and the framing that governs everything

This project demonstrates **Dynamic Application Security Testing (DAST)**: it runs
[OWASP ZAP](https://www.zaproxy.org/) against a locally-booted
[OWASP Juice Shop](https://owasp.org/www-project-juice-shop/), asserts the scan detects the
vulnerability classes Juice Shop is known to contain, and publishes the scan report.

> **Mandatory framing — repeated on every surface.** Juice Shop is an **intentionally vulnerable**
> application, published by OWASP as a training and demonstration target. It is **not a real product**,
> and the findings in this repository's reports are **expected** — that is the entire point of the
> target. Nothing here reports on the security of any real system, and no third-party system is ever
> scanned.

This labelling requirement is the single most important **non-technical** requirement of the project
(D2.6a). It must appear in: the repo README, the published Pages report, the landing-page link text,
and the report page header — each stating the target's nature and the pinned versions.

**Non-goals.** Not a security assessment of anything real. Not a claim of comprehensive coverage. Not a
penetration test. No external host is ever a target (see §7).

## 2. Recorded decisions

Decisions were taken by the owner on 2026-08-05 and are binding; per-decision rationale (pros and the
accepted trade-off) lives in the upstream doc §2.7 and is not repeated here.

| ID | Decision |
| --- | --- |
| **D2.1a** | Gate = **positive detection** + baseline guard (not "fail on any High") |
| **D2.2a** | PR gate = **baseline (passive) scan**; **no active scan**, not even nightly |
| **D2.3a** | **ZAP Docker image run directly** (digest-pinned), not the official Action |
| **D2.4b** | **ZAP + BDD "confirm the vulnerability" scenarios from v1** *(the one divergence from the defaults)* |
| **D2.5a** | Findings assertions in **TypeScript** |
| **D2.6a** | Publish the **labelled ZAP HTML report** to GitHub Pages |
| **D2.7a** | Repo name **`juice-shop-dast-automation`** |

### 2.1 Phase 0 amendments (implementation precision, no decision reversed)

Phase 0 scanned the pinned target three times and produced two corrections to *how* D2.1a is built:

1. **The assertion set is misconfiguration + information-disclosure, not injection.** A passive baseline
   does not attack, so it detects **no** SQLi/XSS. The upstream doc illustrated positive detection with
   "SQLi, XSS, security-misconfiguration"; only the third is achievable passively. The lane asserts the
   seven classes in §4, and says so in exactly those terms.
2. **The guard is a new-class guard, not a new-HIGH guard.** No HIGH or Critical finding exists in a
   passive baseline of this target, so a HIGH-only guard would never fire. Failing on **any class
   outside the reviewed baseline** still catches a HIGH regression and additionally catches Medium/Low
   drift.

**Consequence for D2.4b:** the BDD scenarios are the **only** place this project demonstrates an actual
exploit. D2.4b is therefore load-bearing, not decorative, and cannot be deferred without leaving v1 with
no exploitation story. The division of labour must be stated plainly wherever results appear:

> the **scan** proves the tooling detects real misconfiguration/disclosure classes;
> the **BDD scenarios** prove specific documented vulnerabilities are genuinely exploitable.

## 3. Architecture

```
docker network (isolated, user-defined bridge)
  ├── juice-shop        bkimminich/juice-shop@sha256:…   (target, port 3000)
  └── zap               ghcr.io/zaproxy/zaproxy@sha256:… (scanner)
        └── zap-baseline.py -t http://juice-shop:3000 -J report.json -r report.html -m 2 -T 5
                 │
                 ├── report.json  → parsed by the TypeScript findings model → PASS/FAIL verdict
                 └── report.html  → labelled + published to Pages (/  or /security/)
```

The scanner addresses the target **by container name on a private network** — not via a host port, and
never via a configurable URL (§7).

**Pins (load-bearing).** The expected-class contract in §4 is valid **only** for this pair:

| Component | Digest | Version |
| --- | --- | --- |
| Juice Shop | `sha256:e68144772ebaaca0ec117b38d44903af92416793230288ef7c5437fc4f26850a` | 20.1.1 |
| ZAP | `sha256:8d387b1a63e3425beef4846e39719f5af2a787753af2d8b6558c6257d7a577a2` | 2.17.0 |

A version bump **requires** re-running the Phase 0 probe and re-reviewing the baseline. This is recorded
as a standing maintenance trigger in the backlog.

## 4. The expected-class contract (D2.1a positive detection)

Verified stable across three scans (fresh / same-container / fresh) — classes **and** instance counts:

| Plugin | Class | Risk |
| --- | --- | --- |
| 10038 | Content Security Policy (CSP) Header Not Set | Medium |
| 10098 | Cross-Domain Misconfiguration | Medium |
| 90004 | Cross-Origin-Embedder-Policy Header Missing or Invalid | Low |
| 90004 | Cross-Origin-Opener-Policy Header Missing or Invalid | Low |
| 10063 | Deprecated Feature Policy Header Set | Low |
| 10096 | Timestamp Disclosure - Unix | Low |
| 10110 | Dangerous JS Functions | Low |

**Verdict rules:**

- **PASS** requires **every** class above to be present. A missing class means the scan stopped
  detecting something it should — that is a real failure (broken scan config, changed target), and it is
  the failure mode positive detection exists to catch.
- **FAIL** on any class present that is **not** in this table (the new-class guard) — reviewed and either
  added to the baseline or investigated.
- **Assert class presence, never instance counts.** Counts were stable but are an artifact of spider
  coverage and would break on any scope change.
- **The Informational band is excluded from the verdict** — plugin 10049 (cache classification) was the
  sole source of nondeterminism observed. Informational findings **remain in the published report**;
  suppressing real findings to make a gate green would be less truthful, and they simply do not gate.

**`zap-baseline.py`'s exit code is not the verdict.** It exits non-zero whenever any WARN exists — which
is *always*, on this target by design. The verdict comes from parsing `report.json`. (This mirrors the
lesson the ParaBank perf lane learned twice: trust the artefact's content, not a status signal.)

## 5. Findings model + assertions (D2.5a)

TypeScript, mirroring the portfolio's house stack:

- `src/findings/zap-report.ts` — typed model of ZAP's JSON (site → alerts → instances), a `normalise()`
  that reduces a report to a `{pluginId, name, risk}` class set, and a risk-band filter.
- `src/findings/expected-classes.ts` — the §4 table as data, with its provenance (probe date, pins) in
  the file.
- `src/findings/verdict.ts` — pure function: `(report, expected) → {pass, missing[], unexpected[]}`.
- **Unit-tested against committed fixture JSON** captured from the probe, so the verdict logic is fully
  testable **without booting a container**. This keeps the gate's own logic fast and deterministic, and
  lets us test failure modes (a missing class, an unexpected class) that a real scan won't produce on
  demand.

## 6. BDD confirmation scenarios (D2.4b)

Cucumber + TypeScript in the portfolio's Screenplay idiom. Each scenario is explicitly tied in-code to
the documented Juice Shop vulnerability it exercises, and asserts the exploit **succeeds** — an
inversion of normal test polarity that must be commented as deliberate.

Candidate scenarios for v1 (final selection during Phase 3):

1. **Sensitive file exposure** — retrieve files from Juice Shop's deliberately-exposed `/ftp/` directory.
   *Evidence-backed:* the Phase 0 spider reached `/ftp/eastere.gg` and `/ftp/package-lock.json.bak`.
2. **SQL-injection login bypass** — the documented admin-login bypass via the login endpoint.
   *Not yet verified by probe* — to be confirmed in Phase 3 before being claimed anywhere.
3. **A third class (XSS or broken access control)** — selected in Phase 3.

Scenarios 2 and 3 are **candidates, not commitments**: nothing about them is claimed on any public
surface until the implementation demonstrates them against the pinned image. Each scenario is coupled to
a specific vulnerability, so a Juice Shop bump can break them — the same pin/re-verify discipline as §3.

## 7. Safety (non-negotiable)

- **The scan target is hard-coded to the local container.** It is not a parameter, not an input, not an
  environment variable that CI or a contributor could repoint. Even under D2.2a — where nothing is
  actively attacked — no mechanism capable of aiming outward will be built.
- **No active scanning.** Passive baseline only (D2.2a); the repo ships no active-scan path.
- **The exploit scenarios run only against the locally-booted pinned container**, on the private network,
  in the same job that started it.
- **Least privilege:** the scan job needs **no secrets**; workflow permissions are `contents: read` plus
  the Pages permissions only on the deploy job.

## 8. Evidence + publishing (D2.6a)

ZAP's HTML report is published to GitHub Pages, wrapped/prefixed with the §1 framing banner stating the
target's nature and the pinned Juice Shop + ZAP versions. The published page is the public artefact and
links from the portfolio landing page under the existing public-evidence pattern.

The report is committed to the repo (like ParaBank's perf summary) so the published artefact is
reproducible and diffable, and the raw `report.json` is retained as a CI artifact.

## 9. CI shape

Single workflow, PR-blocking (unlike the ParaBank perf lane, this one is deterministic enough to gate):

1. Boot pinned Juice Shop on a private network; wait for readiness (HTTP 200).
2. Run pinned ZAP baseline scoped to the container name.
3. Parse `report.json` → verdict (§4). **Fail the job on a missing or unexpected class.**
4. Run the BDD confirmation scenarios against the same container.
5. Publish: upload `report.json` as an artifact; deploy the labelled HTML report to Pages on `main`.
6. Tear down.

Gate cascade per house convention: `npm run verify` = typecheck + unit tests (findings model) + lint;
the container-dependent scan/BDD steps run in CI and via an explicit local script, not inside `verify`
(so `verify` stays fast and Docker-free) — the same split ParaBank uses for its perf lane.

## 10. Licensing

Juice Shop **MIT**, ZAP **Apache-2.0** — both clean for this use, and neither is redistributed; they are
pulled as pinned upstream images at run time. No licensing question of the kind portfolio item P-04
raised.

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| Juice Shop / ZAP version bump invalidates §4 | Digest pins + a standing backlog trigger to re-run the probe |
| Informational-band nondeterminism | Excluded from the verdict (§4), retained in the report |
| BDD scenarios coupled to specific vulns break on bump | Same pin discipline; scenarios name their vuln explicitly |
| Published findings misread as a real product's security posture | §1 framing on every surface — the project's top non-technical requirement |
| Spider scope change silently alters findings | Scope (`-m 2 -T 5`) is part of the contract and recorded here |

## 12. Delivery phases

| Phase | Content | State |
| --- | --- | --- |
| 0 | Feasibility probe | **DONE** — see the probe report |
| 1 | This design note | **current** |
| 2 | Scan orchestration + TS findings model/assertions + fixtures | planned |
| 3 | BDD confirmation scenarios | planned |
| 4 | CI + published labelled report (Pages) | planned |
| 5 | `onboard-project`, README, backlog, handover v1 | planned |

Publishing the repository (creating the public GitHub remote) is **not** required until Phase 4 and will
be done only on the owner's explicit go-ahead.
