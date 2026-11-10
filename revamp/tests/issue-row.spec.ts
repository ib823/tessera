import { test, expect, type Page } from '@playwright/test';

/**
 * Every list draws an issue with the shared IssueRow: the desktop reading
 * list beside an open issue, Latest, Saved and Search, at every width. The
 * reading list used to have its own row with a side score column sized to
 * its widest line, so "Resume from insight N of M" squeezed started issues'
 * headlines into one or two words per line, and each list named the same
 * state differently ("Resume from insight", "Continue from angle", "In
 * progress"). Selectors use repo-owned data-* attributes.
 */

test.use({ serviceWorkers: 'block' });

async function seed(page: Page, ids: string[]) {
  await page.addInitScript((started) => {
    if (sessionStorage.getItem('issue-row-seeded')) return;
    started.forEach((id, n) => localStorage.setItem(`tfa:v1:read:${id}`, JSON.stringify({ state: 'started', progress: 3 + (n % 3) })));
    sessionStorage.setItem('issue-row-seeded', '1');
  }, ids);
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
}

async function feedIds(page: Page) {
  const feed = (await (await page.request.get('/issues-feed.json')).json()) as Array<{ id: string }>;
  return feed.slice(0, 6).map((issue) => issue.id);
}

for (const width of [1024, 1440, 1920]) {
  test(`reading list rows share one headline measure at ${width}px`, async ({ page }) => {
    const ids = await feedIds(page);
    await seed(page, ids);
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/issue/${ids[0]}`);
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

    const rows = page.locator('#app-sidebar').getByRole('option');
    await expect(rows.first()).toBeVisible();
    const sample = Math.min(await rows.count(), 6);
    const widths: number[] = [];
    for (let i = 0; i < sample; i++) {
      const row = rows.nth(i);
      await row.scrollIntoViewIfNeeded();
      const rowBox = (await row.boundingBox())!;
      const headline = row.locator('[data-row-headline]');
      const headlineBox = (await headline.boundingBox())!;
      widths.push(headlineBox.width);
      expect(headlineBox.width, `row ${i} headline in a ${Math.round(rowBox.width)}px row`).toBeGreaterThanOrEqual(rowBox.width * 0.8);
      const state = row.locator('[data-row-state]');
      if (await state.count()) {
        const stateBox = (await state.boundingBox())!;
        expect(stateBox.y, 'reading state sits under the headline').toBeGreaterThan(headlineBox.y + headlineBox.height - 1);
      }
    }
    expect(Math.max(...widths) - Math.min(...widths), `headline widths ${widths.map(Math.round).join(', ')}`).toBeLessThanOrEqual(1);
    const started = rows.filter({ has: page.locator('[data-row-state]', { hasText: /^Continue at card \d+ of \d+/ }) });
    await expect(started.first()).toBeVisible();
  });
}

test('an issue reads the same in the reading list, Saved and Latest', async ({ page }) => {
  const ids = await feedIds(page);
  await seed(page, ids);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?view=library&tab=archive');
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

  // Saved shows the compact reading list beside the full archive.
  const sidebarRow = page.locator('#app-sidebar').getByRole('option').filter({ has: page.locator('[data-row-state]', { hasText: /^Continue at card/ }) }).first();
  await expect(sidebarRow).toBeVisible();
  const headline = (await sidebarRow.locator('[data-row-headline]').textContent())!.trim();
  const signal = (await sidebarRow.locator('[data-row-signal]').textContent())!.trim();
  const state = (await sidebarRow.locator('[data-row-state]').textContent())!.trim();
  expect(signal).toMatch(/^Opinion Shift \d+ · \w+$/);

  const archiveRow = page.locator('[data-issue-row][data-density="regular"]').filter({ has: page.locator('[data-row-headline]', { hasText: headline }) }).first();
  await expect(archiveRow.locator('[data-row-signal]')).toHaveText(signal);
  await expect(archiveRow.locator('[data-row-state]')).toHaveText(state);

  await page.goto('/?feed=latest');
  await expect(page.locator('[data-latest-list]')).toBeVisible();
  const latestRow = page.locator('[data-latest-list] [data-issue-row]').filter({ has: page.locator('[data-row-headline]', { hasText: headline }) }).first();
  await latestRow.scrollIntoViewIfNeeded();
  await expect(latestRow.locator('[data-row-signal]')).toHaveText(signal);
  await expect(latestRow.locator('[data-row-state]')).toHaveText(state);
});

test('phone and tablet lists use the same row, with the headline beside the art', async ({ page }) => {
  const ids = await feedIds(page);
  await seed(page, ids);
  for (const [width, height] of [[360, 740], [820, 1180]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/?view=library&tab=archive');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
    const row = page.locator('[data-issue-row]').filter({ has: page.locator('[data-row-state]', { hasText: /^Continue at card/ }) }).first();
    await row.scrollIntoViewIfNeeded();
    await expect(row.locator('[data-row-signal]')).toHaveText(/^Opinion Shift \d+ · \w+$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}px has no sideways scroll`).toBeLessThanOrEqual(1);
    const headlineBox = (await row.locator('[data-row-headline]').boundingBox())!;
    const rowBox = (await row.boundingBox())!;
    expect(headlineBox.width, `${width}px headline keeps most of the row beside the art`).toBeGreaterThanOrEqual(rowBox.width * 0.55);
  }
});
