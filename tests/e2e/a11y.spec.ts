import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Phase 9 smoke test #3 (brief-v3): @axe-core/playwright on every project ×
 * viewport. Fails on serious + critical violations. Known-acknowledged
 * baseline entries (if any) would live in a `baseline.json` file here with
 * an ADR entry explaining why; none are currently tolerated.
 *
 * The full scans below were skipped as a "hydration timeout". The page was
 * crashing: sw.js called navigator.clearAppBadge() on the App's APP_VISIBLE
 * message, and chrome-headless-shell kills the renderer when a service worker
 * uses the Badging API. sw.js now skips that call without notification
 * permission.
 */
/**
 * Targeted guards for the WCAG fixes in the colour tokens and control labels:
 * 1.4.3 contrast (light and dark) and 2.5.3 label-in-name, on the home page,
 * an issue page and About.
 */
test.describe('Contrast and label-in-name', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const path of ['/', '/issue/0146', '/about']) {
      test(`${path} (${colorScheme}) has no contrast or label-in-name violations`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        if (path !== '/about') {
          await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
        }
        const results = await new AxeBuilder({ page })
          .withRules(['color-contrast', 'label-content-name-mismatch'])
          .analyze();
        const summary = results.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`));
        expect(summary).toEqual([]);
      });
    }
  }
});

test.describe('Automated accessibility', () => {
  test('home page has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    if (blocking.length) {
      console.error('axe violations:', JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });

  test('/issue/0146 has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/issue/0146');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    if (blocking.length) {
      console.error('axe violations:', JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });
});
