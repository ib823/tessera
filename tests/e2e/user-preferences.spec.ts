import { test, expect } from '@playwright/test';

/**
 * Phase 9 smoke tests (brief-v3): prefers-reduced-motion + forced-colors +
 * storage-blocked behavior. These emulate OS-level user preferences via
 * Playwright's page.emulateMedia() and a storage-override init script.
 *
 * These were skipped as a "hydration hang". Hydration was fine: sw.js called
 * navigator.clearAppBadge() on the App's APP_VISIBLE message, and
 * chrome-headless-shell kills the renderer when a service worker uses the
 * Badging API. sw.js now skips that call without notification permission, so
 * these run with the real service worker.
 */

test.describe('prefers-reduced-motion', () => {
  test('reduced-motion emulation kills transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
    const probe = await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.transition = 'opacity 500ms';
      document.body.appendChild(div);
      const computed = getComputedStyle(div).transitionDuration;
      div.remove();
      return computed;
    });
    const ms = parseFloat(probe) * (probe.endsWith('ms') ? 1 : 1000);
    expect(ms).toBeLessThan(50);
  });
});

test.describe('forced-colors', () => {
  test.describe('static article', () => {
    // The static article is the no-JavaScript view. Once the reader mounts,
    // App adds html.js-reader-mounted and the article is display:none, so
    // with JavaScript on this label was visible only until hydration won
    // the race against the first visibility check (about 1 run in 5 under
    // parallel load). Pin the state the assertion is about.
    test.use({ javaScriptEnabled: false });

    test('forced-colors: active applies the forced-colors block', async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      // domcontentloaded — same reasoning as ssg-article.spec.ts: we need
      // the static HTML parsed, not every resource loaded.
      await page.goto('/issue/0146', { waitUntil: 'domcontentloaded' });
      // Opinion Shift severity label renders as text (not color-only). Static
      // SSG element from Phase 8a.
      const severity = page.locator('.ssg-article__score-severity').first();
      await expect(severity).toBeVisible();
      const text = await severity.innerText();
      expect(['Fundamental', 'Significant', 'Partial', 'Surface']).toContain(text);
    });
  });

  test('forced-colors: active, the reader hydrates and shows the issue', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/issue/0146');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.ssg-article__score-severity').first()).toBeHidden();
  });
});

test.describe('storage-blocked path', () => {
  test('localStorage.setItem throwing shows the banner without breaking navigation', async ({ page }) => {
    await page.addInitScript(() => {
      const origSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function () {
        throw new DOMException('QuotaExceeded', 'QuotaExceededError');
      };
      (window as unknown as { __origSet: typeof origSet }).__origSet = origSet;
    });
    await page.goto('/');
    const banner = page.getByTestId('storage-blocked-banner');
    await expect(banner).toBeVisible({ timeout: 15_000 });
    // Banner copy contains "isn't being saved" — match a substring of that.
    await expect(banner).toContainText(/isn.?t being saved/i);
    await page.getByRole('button', { name: /dismiss storage warning/i }).click();
    await expect(banner).toBeHidden();
  });
});
