import { test, expect } from '@playwright/test';

/**
 * Enlarged text (WCAG 1.4.4, playbook §14): with text at double size, key
 * pages still fit a phone screen without scrolling sideways. The
 * accessibility statement (/accessibility) relies on this.
 *
 * Doubling the root font size stands in for a reader raising the browser's
 * default text size: the site sizes text in rem.
 */

const PAGES = ['/', '/about', '/accessibility', '/privacy', '/privasi', '/contact', '/disclaimer', '/progress'];

test.use({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });

for (const path of PAGES) {
  test(`${path} fits a phone screen at double text size`, async ({ page }) => {
    await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
    await page.goto(path);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
      .toBeLessThanOrEqual(0);
  });
}

test('an issue page fits a phone screen at double text size', async ({ page, request, baseURL }) => {
  const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as Array<{ id: string }>;
  await page.goto(`/issue/${feed[0].id}`);
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    .toBeLessThanOrEqual(0);
});
