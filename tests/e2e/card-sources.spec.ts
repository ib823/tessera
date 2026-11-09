import { readdirSync, readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

/**
 * Per-card source links (audit P0-2). A hook or fact card's `src` refs resolve
 * to entries of the issue's source list and render under the card: in the
 * static article (no JS), in the desktop reader and in the mobile reader.
 *
 * The fixture is read from the data, not hard-coded: the first published issue
 * whose first fact card links two or more sources with URLs.
 */

interface Entry { n: number; ref: string; title: string; publisher: string | null; url: string | null }
interface Card { t: string; big: string; src?: string[] }

function pickFixture() {
  for (const f of readdirSync('src/data/issues').sort()) {
    const issue = JSON.parse(readFileSync(`src/data/issues/${f}`, 'utf8'));
    if (!issue.published) continue;
    const cards: Card[] = issue.cards;
    const index = cards.findIndex((c) => c.t === 'fact');
    const card = cards[index];
    if (!card?.src || card.src.length < 2) continue;
    const { entries } = JSON.parse(readFileSync(`src/data/sources/${issue.id}.json`, 'utf8')) as { entries: Entry[] };
    const cited = card.src.map((r) => entries.find((e) => String(e.ref) === r)!);
    if (cited.some((e) => !e?.url)) continue;
    const linkedCards = cards.filter((c) => (c.t === 'hook' || c.t === 'fact') && c.src?.length).length;
    return { id: issue.id as string, index, big: card.big, cited, linkedCards };
  }
  throw new Error('No published issue links two sources on its first fact card');
}

const fx = pickFixture();

test.describe('Per-card sources', () => {
  test('static article shows each linked card\'s sources, numbered as in the Sources list', async ({ request, baseURL }) => {
    const html = await (await request.get(`${baseURL}/issue/${fx.id}`)).text();
    const article = html.slice(html.indexOf('<article'), html.indexOf('</article>'));
    expect([...article.matchAll(/data-card-sources\b/g)]).toHaveLength(fx.linkedCards);

    const cardStart = article.indexOf(`data-card-index="${fx.index}"`);
    const cardHtml = article.slice(cardStart, article.indexOf('</section>', cardStart));
    expect(cardHtml).toContain(`data-count="${fx.cited.length}"`);
    for (const entry of fx.cited) {
      expect(cardHtml).toContain(`href="${entry.url!.replace(/&/g, '&amp;')}"`);
      expect(cardHtml).toContain(`data-source-n="${entry.n}"`);
    }
    // Reframe, analogy and view cards never carry source links.
    for (const t of ['reframe', 'analogy', 'view']) {
      const re = new RegExp(`data-card-type="${t}"[\\s\\S]*?</section>`, 'g');
      for (const m of article.matchAll(re)) expect(m[0]).not.toContain('data-card-sources');
    }
  });

  test('desktop reader lists the sources under the fact card', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) < 1024, 'Desktop reader');
    await page.goto(`/issue/${fx.id}`);
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
    const block = page.locator(`[data-step="${fx.index}"] [data-card-sources][data-variant="desktop"]`);
    await expect(block).toBeVisible();
    const links = block.locator('a');
    await expect(links).toHaveCount(fx.cited.length);
    for (const [k, entry] of fx.cited.entries()) {
      await expect(links.nth(k)).toHaveAttribute('href', entry.url!);
      await expect(links.nth(k)).toHaveAttribute('target', '_blank');
      await expect(links.nth(k)).toContainText(entry.title);
    }
  });

  test('mobile reader shows the publishers on the card, and a tap does not turn the card', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto(`/issue/${fx.id}#card-${fx.index + 1}`);
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
    const block = page.locator('[data-card-sources][data-variant="mobile"]');
    await expect(block).toBeVisible();
    const links = block.locator('a');
    await expect(links).toHaveCount(fx.cited.length);
    for (const [k, entry] of fx.cited.entries()) {
      await expect(links.nth(k)).toHaveAttribute('href', entry.url!);
      await expect(links.nth(k)).toContainText(entry.publisher ?? '');
      const box = await links.nth(k).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }

    // The link opens the source in a new tab; the card stays where it was.
    await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.fulfill({ status: 204, body: '' }));
    const [popup] = await Promise.all([context.waitForEvent('page'), links.first().tap()]);
    await popup.waitForLoadState('domcontentloaded');
    expect(new URL(popup.url()).host).toBe(new URL(fx.cited[0].url!).host);
    await popup.close();
    await expect(page.getByText(fx.big, { exact: true })).toBeVisible();
    await expect(block).toBeVisible();
    await context.close();
  });
});
