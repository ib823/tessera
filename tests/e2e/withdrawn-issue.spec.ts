import { readdirSync, readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

/**
 * A withdrawn issue (published, then set to published: false; publishedAt
 * kept) keeps its page, corrected, so links and cached copies do not go on
 * serving the text it was withdrawn for. The page is noindex, carries a
 * Withdrawn notice and the change log, and mounts no reader. Picked from the
 * data so the spec follows whichever issues are withdrawn.
 */
const WITHDRAWN = readdirSync('src/data/issues')
  .map((f) => JSON.parse(readFileSync(`src/data/issues/${f}`, 'utf8')))
  .filter((i) => i.published !== true && i.publishedAt);

test.describe('Withdrawn issues', () => {
  test('keep a corrected, noindex page with a Withdrawn notice', async ({ request, baseURL }) => {
    test.skip(WITHDRAWN.length === 0, 'No withdrawn issue in the data');
    for (const issue of WITHDRAWN) {
      const res = await request.get(`${baseURL}/issue/${issue.id}`);
      expect(res.status(), `/issue/${issue.id}`).toBe(200);
      const html = await res.text();
      expect(html).toContain('<meta name="robots" content="noindex"');
      expect(html).toContain('data-issue-withdrawn');
      expect(html).toContain('data-issue-changes');
      expect(html).not.toContain('application/ld+json');
      const h1 = /<h1 id="ssg-headline"[^>]*>([^<]*)</.exec(html)?.[1] ?? '';
      expect(h1.replace(/&#39;/g, "'").replace(/&amp;/g, '&')).toBe(issue.headline);
    }
  });

  test('stay out of the feed and the sitemap', async ({ request, baseURL }) => {
    test.skip(WITHDRAWN.length === 0, 'No withdrawn issue in the data');
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as Array<{ id: string }>;
    const sitemap = await (await request.get(`${baseURL}/sitemap.xml`)).text();
    for (const issue of WITHDRAWN) {
      expect(feed.some((i) => i.id === issue.id)).toBe(false);
      expect(sitemap).not.toContain(`/issue/${issue.id}<`);
    }
  });

  test('render without the reader', async ({ page }) => {
    test.skip(WITHDRAWN.length === 0, 'No withdrawn issue in the data');
    await page.goto(`/issue/${WITHDRAWN[0].id}`);
    await expect(page.locator('[data-issue-withdrawn]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(WITHDRAWN[0].headline);
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(0);
  });
});
