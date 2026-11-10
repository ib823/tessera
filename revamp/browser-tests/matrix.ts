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
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    // Test opt-in UI without contacting production workers or outside publishers.
    await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::|\/)|localhost(?::|\/))/, route => route.abort());
    await use(page);
    expect(errors, 'Uncaught browser errors').toEqual([]);
  },
});
export { expect };

export async function open(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `${path} responds successfully`).toBe(true);
  if (path.startsWith('/?') || path === '/' || path.startsWith('/issue/1976')) {
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
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
