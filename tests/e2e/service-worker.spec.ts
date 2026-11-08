import { test, expect } from '@playwright/test';

/**
 * sw.js answers the App's APP_VISIBLE message (sent once the worker is ready
 * and on every visibilitychange) by closing notifications and clearing the app
 * badge. chrome-headless-shell kills the renderer, and with it the page, when
 * a service worker calls the Badging API. That crash once surfaced only as
 * timeouts in specs that wait for the App to mount, and those specs were
 * skipped as a "hydration hang". This guard keeps the real worker in the loop
 * and names the cause if the crash comes back.
 */
test('the page survives sw.js handling APP_VISIBLE', async ({ page }) => {
  const crashed = page
    .waitForEvent('crash', { timeout: 0 })
    .then(() => 'crashed' as const)
    .catch(() => 'closed' as const);

  await page.goto('/');
  const alive = (async () => {
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
    // Once sw.js is active, send the message again, as a tab refocus does.
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: 'APP_VISIBLE' });
    });
    await page.waitForTimeout(1_000);
    return 'alive' as const;
  })();

  const outcome = await Promise.race([crashed, alive]);
  expect(outcome, 'the renderer crashed after sw.js handled APP_VISIBLE').toBe('alive');
});
