// Builds the GitHub Pages site from a completed scan (design note §8): an index page carrying the
// MANDATORY framing banner (design note §1) plus the verdict summary, and the raw ZAP HTML report
// linked alongside it. The framing — "intentionally-vulnerable training target, not a real product,
// pinned versions shown" — is the project's single most important non-technical requirement and is
// asserted by tests/build-pages.test.ts.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { evaluate, formatVerdict } from '../src/findings/verdict.js';
import { PINS } from '../src/findings/expected-classes.js';
import type { ZapReport } from '../src/findings/zap-report.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = resolve(ROOT, 'reports');
const SITE = resolve(ROOT, 'site');

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** The framing banner required on every published surface (design note §1). */
export function framingBanner(pins: typeof PINS): string {
  return `<div class="framing" role="note">
  <strong>About this report — please read.</strong>
  This is a <strong>Dynamic Application Security Testing (DAST)</strong> scan of
  <strong>OWASP Juice Shop</strong>, an <strong>intentionally vulnerable</strong> application published
  by OWASP as a training and demonstration target. <strong>It is not a real product</strong>, and every
  finding here is <strong>expected</strong> — that is the entire purpose of the target. Nothing in this
  report describes the security of any real system, and no third-party system was scanned.
  Pinned versions: <strong>Juice Shop ${esc(pins.juiceShop.version)}</strong>,
  <strong>OWASP ZAP ${esc(pins.zap.version)}</strong>.
</div>`;
}

export function renderIndex(report: ZapReport, pins: typeof PINS, generatedIso: string): string {
  const verdict = evaluate(report);
  const found = verdict.found
    .map((f) => `<li><code>[${esc(f.pluginId)}]</code> ${esc(f.name)} <span class="risk">${esc(f.risk)}</span></li>`)
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OWASP Juice Shop — DAST scan report (training target)</title>
<style>
  :root { color-scheme: light dark; --fg: #1c2430; --muted: #5a6672; --bg: #ffffff;
    --card: #f6f8fa; --border: #e3e8ee; --accent: #b3261e; }
  @media (prefers-color-scheme: dark) {
    :root { --fg: #e6edf3; --muted: #9aa7b4; --bg: #0d1117; --card: #161b22; --border: #30363d; }
  }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0;
    padding: 1.5rem; background: var(--bg); color: var(--fg); line-height: 1.55; }
  main { max-width: 860px; margin: 0 auto; }
  .framing { border: 1px solid var(--accent); border-left: 6px solid var(--accent); border-radius: 8px;
    background: color-mix(in srgb, var(--accent) 8%, var(--bg)); padding: 1rem 1.15rem;
    margin-bottom: 1.5rem; font-size: .95rem; }
  h1 { font-size: 1.5rem; margin: .25rem 0 1rem; }
  .verdict { font-weight: 600; padding: .5rem .8rem; border-radius: 6px; display: inline-block;
    background: var(--card); border: 1px solid var(--border); }
  ul { padding-left: 1.2rem; } li { margin: .2rem 0; }
  .risk { color: var(--muted); font-size: .85rem; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px;
    padding: 1rem 1.15rem; margin: 1rem 0; }
  a { color: inherit; } code { font-size: .9em; }
  .meta { color: var(--muted); font-size: .85rem; margin-top: 1.5rem; }
</style>
</head>
<body>
<main>
  ${framingBanner(pins)}
  <h1>OWASP Juice Shop — DAST scan report</h1>
  <p class="verdict">${verdict.pass ? '✓ Positive-detection verdict: PASS' : '✗ Verdict: FAIL'}</p>

  <div class="card">
    <h2>What this proves — and what it does not</h2>
    <p>The <strong>passive baseline scan</strong> below proves the tooling detects the expected
    security-misconfiguration and information-disclosure classes. A passive scan does not attack, so it
    detects none of the injection classes; those are demonstrated separately by the project's
    <strong>BDD confirmation scenarios</strong> (SQL-injection login bypass, sensitive-file exposure,
    broken access control), which actively exploit the same pinned target.</p>
  </div>

  <div class="card">
    <h2>Detected finding classes (${verdict.found.length})</h2>
    <ul>
      ${found}
    </ul>
    <p class="risk">Informational findings are included in the full ZAP report but do not gate.</p>
  </div>

  <p><a href="./zap-report.html">→ Full OWASP ZAP HTML report</a></p>

  <p class="meta">Generated ${esc(generatedIso)} · Juice Shop ${esc(pins.juiceShop.version)} ·
  OWASP ZAP ${esc(pins.zap.version)} · passive baseline scan.</p>
</main>
</body>
</html>
`;
}

// Guard against running with a stale/empty report — publishing an empty verdict would be misleading.
function main(): void {
  const reportPath = resolve(REPORTS, 'report.json');
  const htmlPath = resolve(REPORTS, 'report.html');
  if (!existsSync(reportPath) || !existsSync(htmlPath)) {
    console.error('build-pages: reports/report.{json,html} missing — run `npm run scan` first.');
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as ZapReport;
  const verdict = evaluate(report);
  if (!verdict.pass) {
    console.error('build-pages: refusing to publish — the scan verdict is FAIL.');
    console.error(formatVerdict(verdict));
    process.exit(1);
  }

  mkdirSync(SITE, { recursive: true });
  writeFileSync(resolve(SITE, 'index.html'), renderIndex(report, PINS, new Date().toISOString()));
  copyFileSync(htmlPath, resolve(SITE, 'zap-report.html'));
  writeFileSync(resolve(SITE, '.nojekyll'), ''); // serve the ZAP report verbatim, no Jekyll pass
  console.log('build-pages: wrote site/index.html + site/zap-report.html');
}

// Only run when invoked directly, so tests can import the pure renderers.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
