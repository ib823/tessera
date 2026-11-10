import { test, expect } from '@playwright/test';

/**
 * The desktop reading list (FeedRow) is a three-column grid whose score column
 * is sized to its widest line. "Resume from insight N of M" used to sit in that
 * column and could not wrap, so started stories squeezed their headlines into
 * about 120px of the 320px sidebar, one or two words per line. The label now
 * sits under the headline. Selectors use repo-owned data-* attributes.
 */

test.use({ serviceWorkers: 'block' });

test('desktop reading list keeps headlines wide when stories are in progress', async ({ page, request }) => {
  const feed = (await (await request.get('/issues-feed.json')).json()) as Array<{ id: string }>;
  const ids = feed.slice(0, 6).map((issue) => issue.id);
  await page.addInitScript((started) => {
    if (sessionStorage.getItem('feed-row-seeded')) return;
    started.forEach((id, n) => localStorage.setItem(`tfa:v1:read:${id}`, JSON.stringify({ state: 'started', progress: 3 + (n % 3) })));
    sessionStorage.setItem('feed-row-seeded', '1');
  }, ids);
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/issue/${ids[0]}`);
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

  const rows = page.getByRole('option').filter({ has: page.locator('[data-feed-progress]') });
  await expect(rows.first()).toBeVisible();
  const count = Math.min(await rows.count(), 4);
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    await row.scrollIntoViewIfNeeded();
    const rowBox = (await row.boundingBox())!;
    const titleBox = (await row.locator('[data-feed-title]').boundingBox())!;
    const progress = row.locator('[data-feed-progress]');
    await expect(progress).toHaveText(/^Resume from insight \d+ of \d+$/);
    const progressBox = (await progress.boundingBox())!;
    expect(titleBox.width, `headline width in a ${Math.round(rowBox.width)}px row`).toBeGreaterThanOrEqual(rowBox.width * 0.55);
    expect(progressBox.y, 'resume label sits under the headline').toBeGreaterThan(titleBox.y + titleBox.height - 1);
  }
});
