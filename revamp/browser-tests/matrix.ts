import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

export const viewports = [
  { width: 320, height: 568 }, { width: 360, height: 640 },
  { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 430, height: 932 },
  { width: 640, height: 360 }, { width: 844, height: 390 },
  { width: 768, height: 1024 }, { width: 820, height: 1180 }, { width: 1024, height: 768 },
  { width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 },
  { width: 2560, height: 1440 }, { width: 3840, height: 2160 },
];
const issuesDir = new URL('../../src/data/issues/', import.meta.url);
const withdrawn = readdirSync(issuesDir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(new URL(f, issuesDir), 'utf8'))).find(i => !i.published && i.publishedAt);
export const surfaces: [string, string][] = [
  ['home', '/'], ['latest', '/?feed=latest'], ['search', '/?q=malaysia'],
  ['search-empty', '/?q=zznonexistentstoryzz'], ['saved', '/?view=library'],
  ['reader', '/issue/1976#card-2'], ['topic', '/topic/legal'], ['dossier', '/dossier/D001'],
  ['graphics', '/infographics'], ['about', '/about'], ['disclaimer', '/disclaimer'],
  ['verify', '/verify'], ['privacy', '/privacy'], ['privasi', '/privasi'],
  ['corrections', '/corrections'], ['contact', '/contact'], ['accessibility', '/accessibility'],
  ['not-found', '/404.html'], ...(withdrawn ? [['withdrawn', `/issue/${withdrawn.id}`] as [string, string]] : []),
];

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    // A hosted run serves the real CSP header; a blocked script or style is a
    // failure. Match violations only, not Firefox's "Ignoring ..." notices.
    page.on('console', message => {
      const text = message.text();
      if (/content[- ]security[- ]policy/i.test(text) && /refused|blocked/i.test(text)) errors.push(text);
    });
    // Test opt-in UI without contacting production workers or outside publishers.
    // Hosted mode (FORA_MATRIX_ORIGIN) allows only the deployment under test.
    const hosted = process.env.FORA_MATRIX_ORIGIN ? new URL(baseURL!).origin : undefined;
    await page.route(hosted ? url => url.origin !== hosted : /^https?:\/\/(?!127\.0\.0\.1(?::|\/)|localhost(?::|\/))/, route => route.abort());
    await use(page);
    expect(errors, 'Uncaught browser errors').toEqual([]);
  },
});
export { expect };

// The app fetches /fact-graph.json once it mounts, and handles a failure.
// WebKit still reports a fetch that a reload or navigation cancels as a page
// error ("Fetch API cannot load ... due to access control checks"), which the
// fixture above counts. Let that startup request finish before a test reloads
// or leaves the page, so a failure there means the app, not the test's timing.
export async function settled(page: Page) {
  await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource')
    .some(entry => entry.name.includes('/fact-graph.json') && (entry as PerformanceResourceTiming).responseEnd > 0))).toBe(true);
}

export async function open(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `${path} responds successfully`).toBe(true);
  if (path.startsWith('/?') || path === '/' || path.startsWith('/issue/1976')) {
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
    await settled(page);
  }
  if (process.env.FORA_MATRIX_ORIGIN) {
    // Hosted mode only. A deployed origin delivers the search index and web
    // fonts after hydration; the local server is effectively instant. /?q=
    // first shows the server-rendered home heading, which the app replaces
    // with Search once the index arrives, and a late Newsreader swap re-lays
    // out headings. Measure the settled page, as a reader sees it.
    await page.waitForLoadState('load');
    if (new URL(path, 'http://localhost').searchParams.has('q')) await expect(page.locator('h1:visible')).toHaveText('Search');
  }
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1:visible')).toHaveCount(1);
}

export async function reflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll, 'No document-level horizontal overflow').toBeLessThanOrEqual(dimensions.width + 1);
  const heading = page.locator('h1:visible');
  const box = await heading.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x, 'Headline left edge').toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width, 'Headline right edge').toBeLessThanOrEqual(dimensions.width + 1);
}

export async function capture(page: Page, testInfo: TestInfo, name = 'screen') {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, animations: 'disabled' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}
