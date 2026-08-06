// Enforces the project's single most important non-technical requirement (design note §1/§8):
// the published page MUST carry the framing that the target is intentionally vulnerable, not a real
// product, with both pinned versions shown. A regression here is a truthfulness defect, so it gates.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { framingBanner, renderIndex } from '../scripts/build-pages.js';
import { PINS } from '../src/findings/expected-classes.js';
import type { ZapReport } from '../src/findings/zap-report.js';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const passingReport = JSON.parse(
  readFileSync(join(fixtures, 'zap-baseline-run1.json'), 'utf8'),
) as ZapReport;

describe('framingBanner', () => {
  const banner = framingBanner(PINS);

  it('states the target is intentionally vulnerable and not a real product', () => {
    expect(banner).toMatch(/intentionally vulnerable/i);
    expect(banner).toMatch(/not a real product/i);
  });

  it('states no third-party/real system was scanned', () => {
    // Whitespace-tolerant: the banner sentence wraps across lines in the source template.
    expect(banner).toMatch(/no\s+third-party\s+system\s+was\s+scanned/i);
    expect(banner).toMatch(/nothing\s+in\s+this\s+report\s+describes\s+the\s+security\s+of\s+any\s+real\s+system/i);
  });

  it('shows both pinned versions', () => {
    expect(banner).toContain(PINS.juiceShop.version);
    expect(banner).toContain(PINS.zap.version);
  });
});

describe('renderIndex', () => {
  const html = renderIndex(passingReport, PINS, '2026-08-06T00:00:00.000Z');

  it('embeds the framing banner', () => {
    expect(html).toMatch(/intentionally vulnerable/i);
    expect(html).toMatch(/not a real product/i);
  });

  it('states the honest scope split (scan vs BDD exploitation)', () => {
    expect(html).toMatch(/passive scan does not attack/i);
    expect(html).toMatch(/BDD confirmation scenarios/i);
  });

  it('renders a PASS verdict and lists the detected classes for the reference report', () => {
    expect(html).toContain('PASS');
    expect(html).toContain('Content Security Policy (CSP) Header Not Set');
  });

  it('links the full ZAP report and shows the pinned versions in the footer', () => {
    expect(html).toContain('zap-report.html');
    expect(html).toContain(PINS.juiceShop.version);
    expect(html).toContain(PINS.zap.version);
  });
});
