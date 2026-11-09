import { test, expect, type Page } from '@playwright/test';

/**
 * Phase 9 smoke test #1 (brief-v3): Home renders the four canonical feed
 * sections.
 *
 * The invariant is also covered by Vitest unit tests on buildFeedSections at
 * src/lib/__tests__/feed-sections.test.ts. These Playwright tests add the
 * render-layer assertion on top, with the real service worker running.
 *
 * Below 768px the app switches to its mobile layout, where Today has no
 * sidebar and the sectioned feed lives in Library > Archive. Narrow viewports
 * assert on that list instead.
 *
 * Selectors target repo-owned data-section / data-section-count attributes
 * (SectionHeader in the desktop sidebar, MobileSectionDivider on mobile),
 * safe from scripts/stealth.mjs renames (it only rewrites data-astro-*).
 */
async function openSectionedFeed(page: Page) {
  const mobileLayout = (page.viewportSize()?.width ?? 1440) < 768;
  await page.goto(mobileLayout ? '/?view=library&tab=archive' : '/');
  // Wait for hydration to finish; App sets this class on success.
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
  // The sections render with the feed, which arrives after mount.
  await expect(page.locator('[data-section]').first()).toBeAttached();
  // 768-1023 px: the sidebar is a drawer behind the header's Browse toggle.
  const browse = page.locator('[data-browse-toggle]');
  if (await browse.isVisible()) {
    await browse.click();
    await expect(browse).toHaveAttribute('aria-expanded', 'true');
  }
}

test.describe('Four-section sidebar invariant', () => {
  test('home renders all four canonical feed sections', async ({ page }) => {
    await openSectionedFeed(page);

    // All four canonical sections must be present in the DOM.
    const sections = page.locator('[data-section]');
    const kinds = await sections.evaluateAll(nodes =>
      Array.from(new Set(nodes.map(n => (n as HTMLElement).dataset.section))),
    );
    const expectedKinds = ['continue', 'new', 'explore', 'completed'];
    for (const kind of expectedKinds) {
      expect(kinds).toContain(kind);
    }
  });

  test('four sections render with count badges even when some are empty', async ({ page }) => {
    // Clear any prior reading state so the test runs against a clean profile.
    await page.addInitScript(() => {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('tfa'));
        keys.forEach(k => localStorage.removeItem(k));
      } catch { /* ignore */ }
    });
    await openSectionedFeed(page);

    // At least the expected 4 data-section labels are rendered.
    // Count badges (data-section-count) should be numeric strings (may be '0').
    const badges = page.locator('[data-section-count]');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).innerText();
      expect(text).toMatch(/^\d+$/);
    }
  });
});
