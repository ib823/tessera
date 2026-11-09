import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Homepage, navigation, prompts and layout (UX audit H-1 to H-9, R-1, R-3,
 * R-4, X-6, X-8 to X-10). Selectors use roles, text and repo-owned data-*
 * attributes only: scripts/stealth.mjs may rename class names.
 */

interface FeedEntry {
  id: string;
  opinionShift: number;
  sourceDate?: string | null;
  cards: Array<{ t: string; lens?: string }>;
}

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

/** Same rule as src/lib/topics.ts: most common lens, ties to the first seen. */
function primaryLens(cards: FeedEntry['cards']): string | null {
  const counts = new Map<string, number>();
  for (const card of cards) if (card.lens) counts.set(card.lens, (counts.get(card.lens) ?? 0) + 1);
  let best: string | null = null;
  let bestCount = 0;
  for (const [lens, count] of counts) {
    if (count > bestCount) {
      best = lens;
      bestCount = count;
    }
  }
  return best;
}

async function openHome(page: Page, path = '/') {
  // Never touch the real sync service from tests.
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
  await page.goto(path);
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
}

/** Mark issues completed before the app loads (tfa:v1:read:{id}). */
function seedCompleted(page: Page, ids: string[]) {
  return page.addInitScript((list: string[]) => {
    for (const id of list) {
      localStorage.setItem(`tfa:v1:read:${id}`, JSON.stringify({ state: 'completed', progress: 6 }));
    }
  }, ids);
}

test.use({ serviceWorkers: 'block' });

test.describe('Today', () => {
  test.use({ viewport: DESKTOP });

  test('dates every lead and briefing card and shows the last published date (H-1, R-3)', async ({ page }) => {
    await openHome(page);
    const lead = page.locator('article').filter({ has: page.locator('[data-lead-label]') });
    await expect(lead.locator('time[data-relative-date]')).toHaveCount(1);

    const briefing = page.locator('section[data-briefing]');
    await expect(briefing).toHaveCount(1);
    const items = briefing.getByRole('button');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
    await expect(briefing.locator('time[data-relative-date]')).toHaveCount(itemCount);

    await expect(page.locator('[data-last-published] time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    await expect(page.getByText(/three times a week/i)).toHaveCount(0);
  });

  test('the daily briefing holds recent issues only, or becomes "Start here" (H-1)', async ({ page, request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    await openHome(page);
    const briefing = page.locator('section[data-briefing]');
    const kind = await briefing.getAttribute('data-briefing');
    if (kind === 'recent') {
      await expect(briefing.getByText('Daily Briefing', { exact: true })).toBeVisible();
      const dates = await briefing.locator('time[data-relative-date]').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('datetime') ?? ''));
      const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
      for (const date of dates) expect(date >= weekAgo, date).toBe(true);
    } else {
      expect(kind).toBe('start-here');
      await expect(briefing.getByText('Start Here', { exact: true })).toBeVisible();
    }
    expect(feed.length).toBeGreaterThan(0);
  });

  test('labels a lead that differs from the newest issue because it was read (H-9)', async ({ page, request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    // TodayView's order: newest date first, then the larger Opinion Shift.
    const newest = [...feed].sort((a, b) => (b.sourceDate ?? '').localeCompare(a.sourceDate ?? '') || b.opinionShift - a.opinionShift)[0];
    await openHome(page);
    await expect(page.locator('[data-lead-label]')).toHaveText('Latest issue');

    const fresh = await page.context().newPage();
    await seedCompleted(fresh, [newest.id]);
    await openHome(fresh);
    await expect(fresh.locator('[data-lead-label]')).toHaveText(/opened the latest issue\. Next up/);
    await fresh.close();
  });

  test('switches between Top and Latest; Latest lists issues newest first with dates (H-2)', async ({ page }) => {
    await openHome(page);
    const top = page.getByRole('tab', { name: 'Top' });
    const latest = page.getByRole('tab', { name: 'Latest' });
    await expect(top).toHaveAttribute('aria-selected', 'true');

    await latest.click();
    await expect(latest).toHaveAttribute('aria-selected', 'true');
    const list = page.locator('[data-latest-list]');
    await expect(list).toBeVisible();
    const dates = await list.locator('time[data-relative-date]').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('datetime') ?? ''));
    expect(dates.length).toBeGreaterThan(1);
    expect([...dates].sort().reverse()).toEqual(dates);

    // Arrow keys move between the two modes.
    await latest.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(top).toHaveAttribute('aria-selected', 'true');
    await expect(list).toHaveCount(0);
  });

  test('topic chip counts add up to the heading, and every chip links to a topic page (H-4, H-5)', async ({ page }) => {
    await openHome(page);
    const summary = await page.locator('[data-topic-summary]').innerText();
    const match = summary.match(/(\d+) issues across (\d+) topics/);
    expect(match, summary).toBeTruthy();
    const counts = await page.locator('[data-topic-count]').allInnerTexts();
    expect(counts.length).toBe(Number(match![2]));
    expect(counts.reduce((sum, n) => sum + Number(n), 0)).toBe(Number(match![1]));

    const chip = page.locator('[data-topic-chip]').first();
    const slug = await chip.getAttribute('data-topic-chip');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`a[href="/topic/${slug}"]`)).toBeVisible();
  });

  test('footer links are 44px targets and include the trust pages (X-6)', async ({ page }) => {
    await openHome(page);
    const footer = page.getByRole('navigation', { name: 'Footer navigation' });
    for (const name of ['How This Works', 'Disclaimer', 'Verify Content', 'Privacy', 'Corrections', 'Contact']) {
      const box = await footer.getByRole('link', { name }).boundingBox();
      expect(box, name).toBeTruthy();
      expect(box!.height, name).toBeGreaterThanOrEqual(44);
    }
  });

  test('the document scrolls, not an inner region (X-8)', async ({ page }) => {
    await openHome(page);
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(900, 600);
    await page.mouse.wheel(0, 900);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
    // The sidebar stays in view while the page scrolls.
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeInViewport();
  });

  test('caps the canvas on very wide screens (H-8)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openHome(page);
    const box = await page.locator('aside#app-sidebar').boundingBox();
    expect(box).toBeTruthy();
    // 1440px canvas centred in 1920px: the sidebar starts 240px in.
    expect(box!.x).toBeGreaterThanOrEqual(200);
  });
});

test.describe('Search', () => {
  test.use({ viewport: DESKTOP });

  test('no results offers topics, a clear button and a way to browse everything', async ({ page }) => {
    await openHome(page);
    await page.locator('#desktop-search').fill('zzqxv');
    const empty = page.locator('[data-search-empty]');
    await expect(empty).toBeVisible();
    await expect(empty.getByRole('link').first()).toHaveAttribute('href', /^\/topic\//);
    await empty.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.locator('#desktop-search')).toHaveValue('');
    await expect(empty).toHaveCount(0);
  });
});

test.describe('Relationship prompts (R-1, R-4)', () => {
  test.use({ viewport: DESKTOP });

  test('a first visit shows no prompt', async ({ page }) => {
    await openHome(page);
    await expect(page.getByRole('tab', { name: 'Top' })).toBeVisible();
    await expect(page.locator('[data-prompt]')).toHaveCount(0);
  });

  test('after a completed issue, exactly one prompt shows', async ({ page, request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    await seedCompleted(page, [feed[feed.length - 1].id]);
    await openHome(page);
    await expect(page.locator('[data-prompt]')).toHaveCount(1);
    await expect(page.locator('[data-prompt="welcome"]')).toBeVisible();

    // Dismissing spends the session's budget: no second prompt replaces it.
    await page.getByRole('button', { name: 'Dismiss welcome message' }).click();
    await expect(page.locator('[data-prompt]')).toHaveCount(0);
  });

  test('the sync prompt explains where reading progress lives', async ({ page, request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    await seedCompleted(page, [feed[0].id]);
    await page.addInitScript(() => localStorage.setItem('tfa:v1:welcome-dismissed', '1'));
    await openHome(page);
    const prompt = page.locator('[data-prompt="sync"]');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('only in this browser');
    await expect(prompt).toContainText('Clearing site data erases it');
    await expect(page.locator('[data-prompt]')).toHaveCount(1);
  });

  test('a shared-link landing shows no prompt on its first screen', async ({ page, request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    await seedCompleted(page, [feed[feed.length - 1].id]);
    await openHome(page, `/issue/${feed[0].id}`);
    await page.waitForTimeout(500);
    await expect(page.locator('[data-prompt]')).toHaveCount(0);
  });
});

test.describe('Phone layout', () => {
  test.use({ viewport: PHONE, hasTouch: true });

  test('the bottom nav has the same destinations as the desktop sidebar (H-3)', async ({ page }) => {
    await openHome(page);
    const dock = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(dock.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(dock.getByRole('button', { name: 'Library' })).toBeVisible();
    await expect(dock.getByRole('link', { name: 'Graphics' })).toHaveAttribute('href', '/infographics');
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('Today scrolls the document with the dock fixed, and the header slides away (X-8)', async ({ page }) => {
    await openHome(page);
    const dock = page.getByRole('navigation', { name: 'Primary navigation' });
    const dockBefore = await dock.boundingBox();
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);
    const dockAfter = await dock.boundingBox();
    expect(Math.round(dockAfter!.y)).toBe(Math.round(dockBefore!.y));
    await expect(page.locator('header[data-collapsed="true"]')).toHaveCount(1);
  });
});

test.describe('Wide layout', () => {
  test('no bottom nav at 1024px and above', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await openHome(page);
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toHaveCount(0);
  });

  test('tablet widths keep the sidebar behind a Browse toggle', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await openHome(page);
    const toggle = page.locator('[data-browse-toggle]');
    await expect(toggle).toBeVisible();
    await expect(page.locator('#desktop-search')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#desktop-search')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#desktop-search')).toBeHidden();
  });
});

test.describe('Static pages', () => {
  test('each topic has a crawlable page listed in the sitemap (H-5)', async ({ request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    const counts = new Map<string, number>();
    for (const issue of feed) {
      const lens = primaryLens(issue.cards);
      if (lens) counts.set(lens, (counts.get(lens) ?? 0) + 1);
    }
    const sitemap = await (await request.get(`${baseURL}/sitemap.xml`)).text();
    for (const [lens, count] of counts) {
      const slug = lens.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      expect(sitemap, slug).toContain(`/topic/${slug}</loc>`);
      const html = await (await request.get(`${baseURL}/topic/${slug}`)).text();
      expect(html).toContain(`<title>${lens} issues | The Fourth Angle</title>`);
      expect(html.match(/href="\/issue\/\d+"/g)?.length ?? 0, slug).toBe(count);
    }
  });

  test('dossiers link back to Today and the Library, and the hidden contents sheet is inert (H-6, X-9)', async ({ page }) => {
    await page.goto('/dossier/D001');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.getByRole('link', { name: 'Today' })).toHaveAttribute('href', '/');
    await expect(nav.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/?view=library');
    await expect(page.getByRole('link', { name: 'Back to Today' })).toHaveAttribute('href', '/');
    await expect(page.locator('[role="dialog"][aria-label="Dossier table of contents"]')).toHaveAttribute('inert', '');
  });

  test('dossier and topic pages have no serious or critical axe violations', async ({ page }) => {
    for (const path of ['/dossier/D001', '/topic/legal']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const blocking = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`));
      expect(blocking, path).toEqual([]);
    }
  });

  test('reading-path segments are at least 24px tall (X-6)', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openHome(page, '/issue/0146');
    const path = page.getByRole('navigation', { name: /Reading path/ });
    const segments = path.getByRole('button');
    expect(await segments.count()).toBeGreaterThan(0);
    for (const box of await segments.evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().height))) {
      expect(box).toBeGreaterThanOrEqual(24);
    }
  });

  test('no visible text on Today is smaller than 12px (X-7)', async ({ page }) => {
    for (const viewport of [DESKTOP, PHONE]) {
      await page.setViewportSize(viewport);
      await openHome(page);
      const small = await page.evaluate(() => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const el = node.parentElement;
          if (!el || !node.textContent?.trim() || el.closest('.sr-only')) continue;
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          if (!rect.width || !rect.height || style.visibility === 'hidden') continue;
          if (parseFloat(style.fontSize) < 12) out.push(`${style.fontSize} ${node.textContent.trim().slice(0, 30)}`);
        }
        return out;
      });
      expect(small, `${viewport.width}px`).toEqual([]);
    }
  });

  test('links in About body text are underlined (X-10)', async ({ page }) => {
    await page.goto('/about');
    const decoration = await page.locator('main p a').first().evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(decoration).toContain('underline');
  });
});
