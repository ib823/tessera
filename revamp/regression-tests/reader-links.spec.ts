import { createHash } from 'node:crypto';
import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { publishedDay } from '../../src/lib/issue-meta';

/**
 * Reader, sharing, SEO and crawl fixes from the UX audit batch:
 * A-2 deck, A-4 arrows, A-5 top-aligned text, A-7 key queue, A-8 related
 * next, A-9 one <h1>, T-2 stage words, T-6 copy for verification, T-9 read
 * time, SH-2 card deep links, S-4 titles, S-6 RSS, S-7 404, S-9 robots,
 * P-4 hero preload, P-6 dossier fonts, P-7 favicons.
 *
 * Selectors use roles, text and repo-owned data-* attributes only: the
 * stealth build step renames framework class names.
 */

const ISSUE = '0146';
const PHONE = { width: 390, height: 844 };

async function waitForReader(page: Page) {
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
}

// Playwright's clipboard permissions differ by engine. Chromium takes both;
// WebKit rejects 'clipboard-write' once a page is open and needs no grant to
// copy; Firefox takes neither, so the generated Playwright config enables its
// async-clipboard test preferences (revamp/scripts/workspace.mjs). The same
// copy/read assertions then run in every engine.
async function allowClipboard(context: BrowserContext, browserName: string) {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  else if (browserName === 'webkit') await context.grantPermissions(['clipboard-read']);
}

// WebKit allows navigator.clipboard.readText() only during a user gesture, so
// there the system clipboard is read by pasting into a blank page of the same
// browser context. Chromium and Firefox read it directly.
async function readClipboard(page: Page, browserName: string) {
  if (browserName !== 'webkit') return page.evaluate(() => navigator.clipboard.readText());
  const reader = await page.context().newPage();
  try {
    await reader.setContent('<textarea aria-label="Clipboard"></textarea>');
    await reader.getByRole('textbox').focus();
    await reader.keyboard.press('ControlOrMeta+V');
    return await reader.getByRole('textbox').inputValue();
  } finally {
    await reader.close();
  }
}

async function issueJson(page: Page, baseURL: string | undefined, id = ISSUE) {
  const res = await page.request.get(`${baseURL}/issues/${id}.json`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()) as { headline: string; context: string; cards: Array<{ t: string; big: string; sub: string; lens?: string }> };
}

test.describe('Feeds, titles and crawl rules', () => {
  test('S-6: /rss.xml lists every published issue, newest first', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/rss.xml`);
    expect(res.ok()).toBeTruthy();
    const xml = await res.text();
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<rss version="2\.0"/);
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as Array<{ id: string; sourceDate: string | null; publishedAt?: string | null }>;
    const items = [...xml.matchAll(/<item>[\s\S]*?<link>[^<]*\/issue\/(\d+)<\/link>[\s\S]*?<\/item>/g)].map((m) => m[1]);
    expect(items).toHaveLength(feed.length);
    const newest = [...feed].sort((a, b) => publishedDay(b).localeCompare(publishedDay(a)) || b.id.localeCompare(a.id))[0];
    expect(items[0]).toBe(newest.id);
  });

  test('S-6 / S-4 / P-4: issue head has the feed link, a short title and the hero preload', async ({ request, baseURL }) => {
    const html = await (await request.get(`${baseURL}/issue/${ISSUE}`)).text();
    expect(html).toMatch(/<link rel="alternate" type="application\/rss\+xml"[^>]*href="\/rss\.xml"/);
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
    const ogTitle = /<meta property="og:title" content="([^"]*)"/.exec(html)?.[1] ?? '';
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(ogTitle.length).toBeLessThanOrEqual(60);
    // The on-page headline is untouched.
    expect(html).toMatch(/<h1[^>]*id="ssg-headline"[^>]*>Gig Workers Act 2025: Mandatory SOCSO Registration; EPF Retirement Still Outside<\/h1>/);
    expect(html).toMatch(new RegExp(`<link rel="preload" as="image" type="image/avif" imagesrcset="/og/issue-${ISSUE}-640w\\.avif`));
    // SH-2: every static card is an anchor target.
    for (let n = 1; n <= 7; n++) expect(html).toContain(`id="card-${n}"`);
  });

  test('S-9: robots.txt allows issue JSON, drops the stale radar line, keeps AI-crawler blocks', async ({ request, baseURL }) => {
    const robots = await (await request.get(`${baseURL}/robots.txt`)).text();
    expect(robots).toContain('Allow: /issues/*.json');
    expect(robots).not.toMatch(/^Disallow: \/issues\/$/m);
    expect(robots).not.toContain('radar-summary');
    for (const bot of ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'PerplexityBot', 'ClaudeBot']) {
      expect(robots).toMatch(new RegExp(`User-agent: ${bot}\\nDisallow: /`));
    }
  });

  test('P-7: favicons are served', async ({ request, baseURL }) => {
    for (const path of ['/favicon.svg', '/favicon.ico', '/favicon.png']) {
      const res = await request.get(`${baseURL}${path}`);
      expect(res.status(), path).toBe(200);
    }
  });
});

test.describe('404 page (S-7)', () => {
  test('offers search and the five latest issues', async ({ page }) => {
    await page.goto('/no-such-page-here');
    const latest = page.getByRole('region', { name: 'Latest issues' });
    await expect(latest.getByRole('listitem')).toHaveCount(5);
    await expect(latest.getByRole('listitem').first().getByRole('link')).toHaveAttribute('href', /^\/issue\/\d+$/);
    const search = page.getByRole('searchbox', { name: 'Search issues' });
    await search.fill('EPF');
    await search.press('Enter');
    await expect(page.getByRole('status')).toContainText(/issues? match/);
    await expect(page.locator('[data-nf-results] a').first()).toHaveAttribute('href', /^\/issue\/\d+$/);
  });
});

test.describe('Desktop reader', () => {
  // These exercise DesktopReader, which App shows from 768px up; pin the
  // width so the phone project does not get the mobile reader instead.
  test.use({ viewport: { width: 1440, height: 900 } });

  test('A-9: one <h1> once the reader mounts', async ({ page }) => {
    await page.goto(`/issue/${ISSUE}`);
    await waitForReader(page);
    await expect(page.locator('#ssg-headline')).toBeAttached();
    await expect(page.locator('h1#ssg-headline')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('SH-2: #card-N opens the reader at that card', async ({ page, baseURL }) => {
    const issue = await issueJson(page, baseURL);
    await page.goto(`/issue/${ISSUE}#card-5`);
    await waitForReader(page);
    const reframe = page.getByRole('article').getByText(issue.cards[4].big, { exact: true });
    await expect(reframe).toBeInViewport();
    await expect(page.getByRole('article').getByText(issue.cards[0].big, { exact: true })).not.toBeInViewport();
  });

  test('T-2 / A-8 / T-6: completion shows stage words, related next and a working verification copy', async ({ page, baseURL, context, browserName }) => {
    await allowClipboard(context, browserName);
    await page.goto(`/issue/${ISSUE}`);
    await waitForReader(page);

    const factCheck = page.getByRole('button', { name: /^Fact check 84/ });
    await factCheck.scrollIntoViewIfNeeded();
    await expect(factCheck).toBeVisible();
    await expect(factCheck).toContainText('FC');
    const help = page.getByRole('button', { name: 'How to read the audit' });
    const box = await help.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await help.click();
    await expect(page.getByText('A Flagged or Disputed score means that stage challenged the draft.')).toBeVisible();

    const related = page.locator('[data-continue-related]');
    await expect(related).toBeVisible();
    await expect(related).toContainText('Continue: related');
    await expect(page.getByRole('button', { name: /^Next in Latest/ })).toBeVisible();

    await page.locator('[data-verify-copy]').last().click();
    const copied = await readClipboard(page, browserName);
    const signatures = (await (await page.request.get(`${baseURL}/signatures.json`)).json()) as { issues: Record<string, { fingerprint: string }> };
    expect(createHash('sha256').update(copied).digest('hex')).toBe(signatures.issues[ISSUE].fingerprint);

    await related.click();
    await expect(page).toHaveURL(/\/issue\/1128$/);
  });
});

test.describe('Mobile reader', () => {
  test.use({ viewport: PHONE });

  test('A-2 / A-4 / A-5: deck on card 1, arrows clear of text, text near the top', async ({ page, baseURL }) => {
    const issue = await issueJson(page, baseURL);
    await page.goto(`/issue/${ISSUE}`);
    await waitForReader(page);
    const dialog = page.getByRole('dialog', { name: `Reading: ${issue.headline}` });
    await expect(dialog.getByText(issue.context, { exact: true })).toBeVisible();

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
      await page.getByRole('button', { name: 'Next card' }).click();
      const card = dialog.getByRole('group', { name: /^Card \d of 7$/ });
      await expect(card).toBeVisible();
      await page.waitForTimeout(800);
      const cardBox = (await card.boundingBox())!;
      const paragraphs = card.locator('p');
      const firstText = (await paragraphs.first().boundingBox())!;
      // Text starts under the card label, not mid-card.
      expect(firstText.y - cardBox.y, `text offset at ${width}px`).toBeLessThan(110);
      for (const name of ['Previous card', 'Next card']) {
        const arrow = (await page.getByRole('button', { name }).boundingBox())!;
        for (let i = 0; i < (await paragraphs.count()); i++) {
          const p = (await paragraphs.nth(i).boundingBox())!;
          // The card area scrolls: compare only the text visible through its
          // viewport, not the off-screen part of a long paragraph's box.
          const clip = (await dialog.getByRole('region', { name: 'Issue reading area' }).boundingBox())!;
          const left = Math.max(p.x, clip.x), right = Math.min(p.x + p.width, clip.x + clip.width);
          const top = Math.max(p.y, clip.y), bottom = Math.min(p.y + p.height, clip.y + clip.height);
          const overlaps = right > left && bottom > top && arrow.x < right && arrow.x + arrow.width > left && arrow.y < bottom && arrow.y + arrow.height > top;
          expect(overlaps, `${name} overlaps card text at ${width}px`).toBe(false);
        }
      }
    }
  });

  test('A-7: arrow presses during a transition are queued, not dropped', async ({ page }) => {
    await page.goto(`/issue/${ISSUE}`);
    await waitForReader(page);
    const dialog = page.getByRole('dialog');
    await dialog.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('group', { name: 'Card 4 of 7' })).toBeVisible({ timeout: 5_000 });
  });

  test('SH-2: a card deep link opens that card, and card shares link to their anchor', async ({ page, context, browserName }) => {
    await allowClipboard(context, browserName);
    await page.goto(`/issue/${ISSUE}#card-3`);
    await waitForReader(page);
    await expect(page.getByRole('group', { name: 'Card 3 of 7' })).toBeVisible();
    await page.getByRole('button', { name: 'Share this card' }).click();
    const sheet = page.getByRole('dialog', { name: /^Share / });
    await sheet.getByRole('button', { name: /Copy link/ }).click();
    await expect(sheet.getByText('Copied!')).toBeVisible();
    const url = await readClipboard(page, browserName);
    expect(url).toMatch(new RegExp(`/issue/${ISSUE}\\?v=[^#]+#card-3$`));
    // T-6: the verification copy is in the share sheet too.
    await expect(sheet.getByRole('button', { name: 'Copy for verification' })).toBeVisible();
  });
});

test.describe('Dossier (T-9, P-6)', () => {
  test('read time follows the word count and no missing font is requested', async ({ page }) => {
    const fontRequests: string[] = [];
    page.on('request', (req) => {
      if (/\/fonts\/(spectral|inter)-/.test(req.url())) fontRequests.push(req.url());
    });
    await page.goto('/dossier/D002');
    await expect(page.getByText('Est. 8 min', { exact: true })).toBeVisible();
    await expect(page.getByText('1,900 words', { exact: true })).toBeVisible();
    expect(fontRequests).toEqual([]);
  });
});

test.describe('One <h1> on phone and tablet (A-9)', () => {
  const TABLET = { width: 820, height: 1180 };

  for (const [name, viewport] of [['phone', PHONE], ['tablet', TABLET]] as const) {
    test(`${name}: an open issue has exactly one <h1>, the issue headline`, async ({ page, baseURL }) => {
      const issue = await issueJson(page, baseURL);
      await page.setViewportSize(viewport);
      await page.goto(`/issue/${ISSUE}`);
      await waitForReader(page);
      await expect(page.getByRole('heading', { level: 1, name: issue.headline })).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test("phone: Today's heading is the page's <h1> again once the reader closes", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto(`/issue/${ISSUE}`);
    await waitForReader(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).first().click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Top stories');
  });
});

test.describe('Share sheet on a touch screen', () => {
  // A tap leaves the button in :hover on touch devices; the hover styles
  // must not change its layout (it used to collapse under the finger).
  test.use({ viewport: PHONE, hasTouch: true });

  test('Copy link keeps its size after a tap and copies the card link', async ({ page, context, browserName }) => {
    await allowClipboard(context, browserName);
    await page.goto(`/issue/${ISSUE}`);
    await waitForReader(page);
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true);
    await page.getByRole('button', { name: 'Share this card' }).tap();
    const sheet = page.getByRole('dialog', { name: /^Share / });
    const copy = sheet.getByRole('button', { name: /Copy link/ });
    await expect(copy).toBeVisible();
    await page.waitForTimeout(400);
    const before = (await copy.boundingBox())!;
    expect(before.height).toBeGreaterThanOrEqual(44);

    await copy.tap();
    await expect(sheet.getByText('Copied!')).toBeVisible();
    const url = await readClipboard(page, browserName);
    expect(url).toMatch(new RegExp(`/issue/${ISSUE}\\?v=[^#]+#card-1$`));

    const after = (await copy.boundingBox())!;
    expect(after.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(after.width - before.width)).toBeLessThan(2);
    expect(await copy.evaluate((el) => getComputedStyle(el).display)).toBe('flex');
  });
});

test.describe('Fact-graph connections on a deep link', () => {
  test('"Tracked in" counts connections when the graph loads after the reader', async ({ page, baseURL }) => {
    const graph = (await (await page.request.get(`${baseURL}/fact-graph.json`)).json()) as {
      connections: Record<string, Array<{ id: string }>>;
    };
    const feed = (await (await page.request.get(`${baseURL}/issues-feed.json`)).json()) as Array<{ id: string }>;
    const published = new Set(feed.map((i) => i.id));
    const expected = (graph.connections[ISSUE] ?? []).filter((c) => published.has(c.id)).length;
    expect(expected).toBeGreaterThan(0);

    // Hold the graph back until the reader is on screen.
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/fact-graph.json*', async (route) => {
      await gate;
      await route.continue();
    });

    // Card 2 is the first fact card, where the label shows on both readers.
    await page.goto(`/issue/${ISSUE}#card-2`);
    await waitForReader(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    release();

    const label = `Tracked in ${expected} ${expected === 1 ? 'issue' : 'issues'}`;
    await expect(page.getByRole('button', { name: new RegExp(`^${label}`) }).first()).toBeVisible();
  });
});
