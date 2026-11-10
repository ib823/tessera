import { test, expect } from '@playwright/test';

/**
 * When a navigation fails offline, sw.js answers with its precached
 * /offline.html. Cloudflare Pages serves that path as a 308 to /offline, so
 * the precached copy is a redirected response, and browsers refuse a
 * redirected response for a navigation: offline readers got the browser's
 * own error page. The local test server does not redirect, so this test
 * answers /offline.html the way Pages does. Playwright routes requests made
 * by a service worker only in Chromium.
 */

test.use({ serviceWorkers: 'allow' });

test('offline navigation shows the offline page when the host redirects /offline.html', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Playwright routes service-worker requests only in Chromium.');
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
  await context.route('**/offline.html', (route) => route.fulfill({ status: 308, headers: { location: '/offline' } }));

  await page.goto('/');
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15_000 });
  await page.waitForLoadState('load');
  // The precached copy is the redirected one, as on Pages.
  await expect.poll(() => page.evaluate(async () => (await caches.match('/offline.html'))?.redirected ?? null)).toBe(true);

  await context.setOffline(true);
  try {
    await page.goto('/issue/offline-fallback-check');
    await expect(page.getByRole('heading', { level: 1, name: "You're offline" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
