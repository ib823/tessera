import { test, expect } from '@playwright/test';

/**
 * A shared `?sync=CODE` link must not join this browser to an Angle Code
 * silently. Linking merges this browser's reading history into the code,
 * where anyone holding the code can read it, so the reader is asked first.
 * Declining leaves the browser unlinked and strips the code from the URL.
 */

test.use({ serviceWorkers: 'block' });

const CODE = 'ABCDEF';

test('a ?sync= link asks before linking, and declining leaves the browser unlinked', async ({ page }) => {
  // Never touch the real sync service from tests.
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());

  const dialogPromise = page.waitForEvent('dialog', { timeout: 15_000 });
  await page.goto(`/?sync=${CODE}`);

  const dialog = await dialogPromise;
  expect(dialog.type()).toBe('confirm');
  expect(dialog.message()).toContain(CODE);
  expect(dialog.message()).toContain('anyone who has the code can see it');
  await dialog.dismiss();

  await expect.poll(() => page.evaluate(() => localStorage.getItem('tfa:v1:angle-code'))).toBeNull();
  expect(new URL(page.url()).searchParams.has('sync')).toBe(false);
});
