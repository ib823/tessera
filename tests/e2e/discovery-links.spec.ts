import { test, expect, type Page } from '@playwright/test';

/**
 * Discovery fixes from the playbook review (sections 06, 07 and screen 08):
 *  1. issue entries are real links: new tab, copy link and crawlers follow
 *     them, and a plain click still opens the issue in place;
 *  2. Back from an issue returns to the same place in Latest, with the list
 *     still expanded (desktop, where the reader replaces Today);
 *  3. search lives in the address (?q=, &type=, &topic=) and survives a
 *     reload and Back;
 *  5. on a phone the reader's h1 headline leads the first card.
 */

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

interface FeedEntry { id: string; published?: boolean }

async function openHome(page: Page, path = '/') {
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
  await page.goto(path);
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
}

test.describe('issue entries are links', () => {
  test.use({ viewport: DESKTOP });

  test('the server-rendered homepage links issues', async ({ request, baseURL }) => {
    const html = await (await request.get(`${baseURL}/`)).text();
    expect((html.match(/href="\/issue\/\d{4}"/g) ?? []).length).toBeGreaterThan(0);
  });

  test('a plain click opens in place; a modified click leaves the page alone', async ({ page, context, browserName }) => {
    await openHome(page);
    await page.getByRole('tab', { name: 'Latest' }).first().click();
    const item = page.locator('[data-latest-list] a').first();
    const href = await item.getAttribute('href');
    expect(href).toMatch(/^\/issue\/\d{4}$/);

    // Modified click: the browser opens a new tab and this page stays put.
    // Only Chromium reliably opens a tab for a modified click under automation.
    if (browserName === 'chromium') {
      const popup = context.waitForEvent('page');
      await item.click({ modifiers: ['ControlOrMeta'] });
      await (await popup).close();
      expect(new URL(page.url()).pathname).toBe('/');
    }

    // Plain click: same document, issue open in place.
    await page.evaluate(() => { (window as unknown as { __sameDoc: boolean }).__sameDoc = true; });
    await item.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    expect(await page.evaluate(() => (window as unknown as { __sameDoc?: boolean }).__sameDoc)).toBe(true);
  });
});

test.describe('Back keeps the reader\'s place', () => {
  test.use({ viewport: DESKTOP });

  test('Latest stays expanded and scrolled after an issue (desktop)', async ({ page }) => {
    await openHome(page);
    await page.getByRole('tab', { name: 'Latest' }).first().click();
    const more = page.locator('button.latest-more');
    test.skip((await more.count()) === 0, 'fewer issues than one page of Latest');
    await more.click();
    const items = page.locator('[data-latest-list] li');
    const shown = await items.count();
    expect(shown).toBeGreaterThan(20);

    const target = items.nth(Math.min(24, shown - 1)).locator('a');
    await target.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(500);
    await target.click();
    await expect(page).toHaveURL(/\/issue\/\d{4}$/);

    await page.goBack();
    await expect(page.locator('[data-latest-list]')).toBeVisible();
    await expect(items).toHaveCount(shown);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 150);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(before + 150);
  });
});

test.describe('search in the address', () => {
  test.use({ viewport: DESKTOP });

  test('?q= restores a search, filters add to the URL, and both survive reload and Back', async ({ page }) => {
    await openHome(page, '/?q=malaysia');
    const status = page.locator('[data-search-count]');
    await expect(status).toBeVisible();
    const all = Number((await status.innerText()).match(/^(\d+)/)![1]);
    expect(all).toBeGreaterThan(1);

    // Result cards are links too.
    await expect(page.locator('main a.card-link[href^="/issue/"]').first()).toBeVisible();

    const chip = page.locator('[data-search-filters] [data-filter-topic]').first();
    await expect(chip).toBeVisible();
    const topic = (await chip.getAttribute('data-filter-topic'))!;
    const count = Number((await chip.locator('.chip-count').innerText()).trim());
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(new RegExp(`[?&]topic=${encodeURIComponent(topic)}`));
    await expect(page.locator('[data-search-count]')).toHaveText(new RegExp(`^${count} results? for "malaysia"$`));

    await page.reload();
    await expect(page.locator(`[data-search-filters] [data-filter-topic="${topic}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-search-count]')).toHaveText(new RegExp(`^${count} results? for "malaysia"$`));

    await page.locator('main a.card-link[href^="/issue/"]').first().click();
    await expect(page).toHaveURL(/\/issue\/\d{4}$/);
    await page.goBack();
    await expect(page).toHaveURL(/[?&]q=malaysia/);
    await expect(page.locator('[data-search-count]')).toHaveText(new RegExp(`^${count} results? for "malaysia"$`));
  });
});

test.describe('mobile reader headline', () => {
  test.use({ viewport: PHONE });

  test('the h1 headline leads the first card, then shrinks to a label', async ({ page, request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    await openHome(page, `/issue/${feed[0].id}`);
    const h1 = page.getByRole('dialog').locator('h1');
    await expect(h1).toBeVisible();
    const size = () => h1.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(await size()).toBeGreaterThanOrEqual(20);
    await page.keyboard.press('ArrowRight');
    await expect.poll(size).toBeLessThan(16);
  });
});
