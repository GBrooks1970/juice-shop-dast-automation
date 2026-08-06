# juice-shop-dast-automation

**Dynamic Application Security Testing (DAST)** — running [OWASP ZAP](https://www.zaproxy.org/) against
[OWASP Juice Shop](https://owasp.org/www-project-juice-shop/), asserting the scan detects the
vulnerability classes the target is known to contain, and publishing the scan report.

> ## ⚠️ About the target — please read
>
> **OWASP Juice Shop is an intentionally vulnerable application.** It is published by OWASP as a
> training and demonstration target, deliberately built to contain security flaws. **It is not a real
> product**, and every finding reported here is **expected** — that is the entire purpose of the target.
>
> **Nothing in this repository reports on the security of any real system**, and no third-party system
> is ever scanned. The scan target is hard-coded to a locally-booted container.

## Status

**Working.** The ZAP passive baseline scan, the positive-detection verdict, and three BDD
exploit-confirmation scenarios all run against the pinned target in CI. See
[docs/backlog.md](docs/backlog.md) for the phased plan and status.

## Running it locally

Requires Docker and Node 24.

```bash
npm ci
npm run verify        # typecheck + unit tests (Docker-free, fast)
npm run dast          # boot Juice Shop, run the ZAP baseline, apply the verdict
npm run bdd           # boot Juice Shop, run the exploit-confirmation scenarios
npm run pages:build   # build the labelled report site from the last scan
```

Each Docker-backed script boots the pinned container, runs, and tears it down. The pass/fail signal
is `npm run scan:verdict` (which parses the report), **not** ZAP's exit code — that is always non-zero
on this deliberately-vulnerable target.

## What it will demonstrate

Two complementary halves, deliberately paired:

| Half | Proves |
| --- | --- |
| **ZAP passive baseline scan** | that the DAST tooling detects real **security-misconfiguration and information-disclosure** classes — breadth, plus the published report, with no attack traffic |
| **BDD confirmation scenarios** | that specific **documented vulnerabilities are genuinely exploitable** — the active-exploitation proof a passive scan structurally cannot provide |

A passive baseline does not attack, so it detects none of the injection classes; the honest split above
is stated wherever results appear rather than blurred into a single "finds vulnerabilities" claim.

The gate is **positive detection**: on an intentionally-vulnerable target, "zero findings" is impossible,
so the meaningful assertion is that the expected classes **are** found — proving the scanner works —
with a new-class guard for anything unexpected.

## Pinned versions

The expected-findings contract is valid only for these pinned images:

| Component | Version |
| --- | --- |
| OWASP Juice Shop | 20.1.1 (digest-pinned) |
| OWASP ZAP | 2.17.0 (digest-pinned) |

## Documentation

- [docs/dast-lane-design.md](docs/dast-lane-design.md) — binding design note (SDD; written before code)
- [docs/backlog.md](docs/backlog.md) — phased delivery plan and status

## Licensing

This repository: see `LICENSE` (added at publication). The tools and target are used as pinned upstream
images and are not redistributed here — OWASP Juice Shop is **MIT**, OWASP ZAP is **Apache-2.0**.
