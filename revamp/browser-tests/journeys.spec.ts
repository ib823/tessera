import { test, expect, open, reflow, capture, settled } from './matrix';

test('search filters survive issue navigation, Back and reload', async ({ page }) => {
  await open(page, '/?q=malaysia');
  const chip = page.locator('[data-search-filters] [data-filter-topic]').first();
  const topic = await chip.getAttribute('data-filter-topic');
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(new RegExp(`topic=${encodeURIComponent(topic!)}`));
  const filteredURL = page.url();
  const links = page.locator('main a[href^="/issue/"]:visible');
  const results = await links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  expect(results.length).toBeGreaterThan(0);
  await page.locator('main a[href^="/issue/"]:visible').first().click();
  await expect(page).toHaveURL(/\/issue\/\d{4}/);
  await expect(page.locator('h1:visible')).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(filteredURL);
  await expect.poll(() => links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(results);
  await page.reload();
  await expect.poll(() => links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(results);
  await expect(page.locator(`[data-filter-topic="${topic}"]`)).toHaveAttribute('aria-pressed', 'true');
});

test('read, highlight, share, reload and find the highlight in Saved', async ({ page, request }, info) => {
  const issue = await (await request.get('/issues/1976.json')).json();
  await open(page, '/issue/1976#card-1');
  const mobile = await page.getByRole('dialog', { name: /^Reading:/ }).count() === 1;
  if (mobile) {
    const dialog = page.getByRole('dialog', { name: /^Reading:/ });
    for (let i = 0; i < issue.cards.length; i++) {
      await expect(dialog.getByRole('group', { name: `Card ${i + 1} of ${issue.cards.length}`, exact: true })).toBeVisible();
      await expect(dialog.locator('[data-reader-primary]')).toHaveText(issue.cards[i].big);
      if (i < issue.cards.length - 1) await dialog.getByRole('button', { name: 'Next card', exact: true }).click();
    }
    for (let i = issue.cards.length - 1; i > 0; i--) {
      await dialog.getByRole('button', { name: 'Previous card', exact: true }).click();
      await expect(dialog.getByRole('group', { name: `Card ${i} of ${issue.cards.length}`, exact: true })).toBeVisible();
    }
    await dialog.getByRole('button', { name: 'Issue details, sources and changes' }).click();
    await expect(dialog.locator('#reader-issue-details')).toContainText('Sources');
    await expect(dialog.locator('#reader-issue-details')).toContainText('What changed');
    await dialog.getByRole('button', { name: 'Issue details, sources and changes' }).click();
  } else {
    for (const card of issue.cards) await expect(page.getByRole('article').getByText(card.big, { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Highlight this insight', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Remove highlight from this insight', exact: true })).toHaveCount(1);
  const saved = await page.evaluate(() => localStorage.getItem('tfa:v1:reactions'));
  expect(JSON.parse(saved!)['1976']).toContain(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove highlight from this insight', exact: true })).toHaveCount(1);
  const share = page.getByRole('button', { name: mobile ? 'Share this card' : 'Share this issue', exact: true });
  await share.click();
  const sheet = page.getByRole('dialog', { name: /^Share / });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
  await capture(page, info, 'share');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(share).toBeFocused();
  await open(page, '/?view=library&tab=highlights');
  await expect(page.getByText(issue.cards[0].big, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('tfa:v1:reactions'))).toBe(saved);
  await capture(page, info, 'saved-highlight');
});

test('Alerts opens by keyboard, stays usable and returns focus', async ({ page }, info) => {
  await open(page, '/');
  const trigger = page.getByRole('button', { name: 'Alerts', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Alerts', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('switch')).toHaveCount(1);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('dialog', { name: /^Reading:/ })).toHaveCount(0);
  await reflow(page);
  await capture(page, info, 'alerts');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('legacy progress and reactions migrate and persist on reload', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('matrix-seeded')) return;
    localStorage.setItem('tfa-read:1976', JSON.stringify({ state: 'started', progress: 2 }));
    localStorage.setItem('tfa-reactions', JSON.stringify({ '1976': [1] }));
    localStorage.setItem('tfa-welcome-dismissed', '1');
    sessionStorage.setItem('matrix-seeded', '1');
  });
  await open(page, '/?view=library');
  const state = await page.evaluate(() => ({
    progress: JSON.parse(localStorage.getItem('tfa:v1:read:1976')!),
    reactions: JSON.parse(localStorage.getItem('tfa:v1:reactions')!),
    migrated: localStorage.getItem('tfa:v1:migrated'),
  }));
  expect(state.progress).toEqual({ state: 'started', progress: 2 });
  expect(state.reactions).toEqual({ '1976': [1] });
  expect(state.migrated).toBeTruthy();
  await page.reload();
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
  await settled(page);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tfa:v1:reactions')!))).toEqual(state.reactions);
  await open(page, '/issue/1976#card-2');
  await expect(page.getByRole('button', { name: 'Remove highlight from this insight', exact: true })).toHaveCount(1);
});

test('no JavaScript still exposes issue text, sources and changes', async ({ browser, baseURL, viewport }) => {
  const context = await browser.newContext({ baseURL, viewport: viewport!, javaScriptEnabled: false, serviceWorkers: 'block' });
  const page = await context.newPage();
  try {
    const issue = await (await context.request.get('/issues/1976.json')).json();
    await page.goto('/issue/1976');
    for (const card of issue.cards) await expect(page.getByText(card.big, { exact: true })).toBeVisible();
    for (const name of ['sources', 'changes']) {
      const section = page.locator(`[data-issue-${name}]`);
      await section.locator('summary').click();
      await expect(section.locator('ol')).toBeVisible();
      expect(await section.locator('li').count()).toBeGreaterThan(0);
    }
    await reflow(page);
  } finally { await context.close(); }
});
