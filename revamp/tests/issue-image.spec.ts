import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

// The site's CSP has no 'unsafe-hashes', so any inline event handler in the
// server-rendered markup is blocked and reported. App routes must ship none.
for (const path of ['/', '/?feed=latest', '/issue/1976', '/topic/legal', '/dossier/D001']) {
  test(`${path} ships no inline event handler attributes`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    expect(html.match(/<[a-z][^>]*\son[a-z]+=["'][^>]*>/gi) ?? []).toEqual([]);
  });
}

test('home hides issue art frames whose images fail to load', async ({ page }) => {
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
  await page.route('**/og/issue-*', (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto('/');
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
  const frames = page.locator('[data-issue-image]');
  expect(await frames.count()).toBeGreaterThan(0);
  // Load the lazy images too, so every frame meets a failed request.
  await page.evaluate(() => document.querySelectorAll<HTMLImageElement>('[data-issue-image] img').forEach((img) => { img.loading = 'eager'; }));
  await expect.poll(() => page.locator('[data-issue-image]:visible').count()).toBe(0);
});
