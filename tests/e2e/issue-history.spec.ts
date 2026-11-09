import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// 1201's modifiedAt is derived from git history by scripts/derive-issue-history.mjs and
// committed in its JSON; read it rather than hard-coding the commit time, so a re-derive
// after a squash merge does not break these assertions.
const MODIFIED_1201: string = JSON.parse(readFileSync('src/data/issues/1201.json', 'utf8')).modifiedAt;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Publication history: the "Published · Updated · Type" line, the "What
 * changed" block, article:* dates, sitemap lastmod and the feed's "Updated
 * since you read it" badge (audit A-3, T-3, S-2, S-3, R-5).
 *
 * Raw-HTML assertions follow ssg-article.spec.ts so they do not depend on the
 * App island hydrating. Selectors are repo-owned data-* attributes, which
 * scripts/stealth.mjs keeps.
 *
 * Fixtures: 1201 was first published on 30 Mar 2026, corrected on 8 Apr and
 * 18 May 2026 and updated on 9 Nov 2026 (edition 4, Explainer). 2018 was
 * published on 8 Nov 2026 and never changed (Explainer). Dates come from
 * scripts/derive-issue-history.mjs.
 */

function slice(html: string, marker: string, tag: string): string {
  const start = html.indexOf(marker);
  expect(start, `${marker} present`).toBeGreaterThan(-1);
  const open = html.lastIndexOf(`<${tag}`, start);
  const close = html.indexOf(`</${tag}>`, start);
  return html.slice(open, close);
}

test.describe('Issue publication history', () => {
  test('/issue/1201 shows published and updated dates, story type and what changed', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/issue/1201`);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    const article = html.slice(html.indexOf('<article'), html.indexOf('</article>'));

    const meta = slice(article, 'data-issue-meta', 'p');
    expect(meta).toMatch(/Published <time datetime="2026-03-30T14:17:24\+08:00"[^>]*>30 Mar 2026<\/time>/);
    expect(MODIFIED_1201.startsWith('2026-11-09')).toBe(true);
    expect(meta).toMatch(new RegExp(`Updated <time datetime="${esc(MODIFIED_1201)}"[^>]*>9 Nov 2026</time>`));
    expect(meta).toContain('data-story-type="Explainer"');
    // The line sits directly under the headline.
    expect(article.indexOf('data-issue-meta')).toBeGreaterThan(article.indexOf('id="ssg-headline"'));
    expect(article.indexOf('data-issue-meta')).toBeLessThan(article.indexOf('<figure'));

    const changes = slice(article, 'data-issue-changes', 'section');
    expect(changes).toContain('data-change-count="3"');
    expect(changes).toMatch(/>What changed \(3\)</);
    expect([...changes.matchAll(/data-change-entry\b/g)]).toHaveLength(3);
    // Newest first, corrections labelled, updates not.
    expect(changes.indexOf('Edition 4')).toBeLessThan(changes.indexOf('Edition 3'));
    expect(changes.indexOf('Edition 3')).toBeLessThan(changes.indexOf('Edition 2'));
    expect([...changes.matchAll(/data-change-kind="correction"/g)]).toHaveLength(2);
    expect([...changes.matchAll(/data-change-kind="update"/g)]).toHaveLength(1);
    expect(changes).toMatch(/>Correction</);
    // Placed after the Sources block, as a native <details> collapsed on the static article.
    expect(article.indexOf('data-issue-changes')).toBeGreaterThan(article.indexOf('data-issue-sources'));
    expect(changes).toMatch(/<details(?![^>]*\bopen\b)[^>]*>/);
  });

  test('/issue/1201 head carries matching article:* times and JSON-LD dates', async ({ request, baseURL }) => {
    const html = await (await request.get(`${baseURL}/issue/1201`)).text();
    expect(html).toContain('<meta property="article:published_time" content="2026-03-30T14:17:24+08:00"');
    expect(html).toContain(`<meta property="article:modified_time" content="${MODIFIED_1201}"`);
    expect(html).toContain('<meta property="article:section" content="Explainer"');

    const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(ld).not.toBeNull();
    const data = JSON.parse(ld![1]);
    expect(data.datePublished).toBe('2026-03-30T14:17:24+08:00');
    expect(data.dateModified).toBe(MODIFIED_1201);
    expect(data.articleSection).toBe('Explainer');
  });

  test('an issue never updated shows no Updated date and no change log', async ({ request, baseURL }) => {
    const html = await (await request.get(`${baseURL}/issue/2018`)).text();
    const article = html.slice(html.indexOf('<article'), html.indexOf('</article>'));
    const meta = slice(article, 'data-issue-meta', 'p');
    expect(meta).toMatch(/Published <time[^>]*>8 Nov 2026<\/time>/);
    expect(meta).not.toContain('Updated');
    expect(article).not.toContain('data-issue-changes');
  });

  test('feed and per-issue JSON carry the history fields', async ({ request, baseURL }) => {
    const feed = await (await request.get(`${baseURL}/issues-feed.json`)).json();
    const row = feed.find((i: { id: string }) => i.id === '1201');
    expect(row).toMatchObject({ publishedAt: '2026-03-30T14:17:24+08:00', modifiedAt: MODIFIED_1201, type: 'Explainer' });
    expect(row.changes).toBeUndefined();

    const issue = await (await request.get(`${baseURL}/issues/1201.json`)).json();
    expect(issue.changes).toHaveLength(3);
    expect(issue.changes[1]).toMatchObject({ edition: 3, date: '2026-05-18' });
    expect(issue.changes[2]).toMatchObject({ edition: 4, date: '2026-11-09' });
  });

  test('sitemap lastmod follows modifiedAt', async ({ request, baseURL }) => {
    const xml = await (await request.get(`${baseURL}/sitemap.xml`)).text();
    expect(xml).toMatch(new RegExp(`<loc>[^<]*/issue/1201</loc>\\s*<lastmod>${esc(MODIFIED_1201)}</lastmod>`));
    expect(xml).toMatch(/<loc>[^<]*\/issue\/2018<\/loc>\s*<lastmod>2026-11-08T18:37:13\+08:00<\/lastmod>/);
  });

  test('desktop reader shows the meta line and an open What changed block', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) < 768, 'Desktop reader only; the mobile reader is covered by the raw-HTML tests.');
    await page.goto('/issue/1201');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

    const meta = page.locator('[data-issue-meta][data-variant="desktop"]');
    await expect(meta).toBeVisible();
    await expect(meta).toContainText('Published 30 Mar 2026');
    await expect(meta).toContainText('Updated 9 Nov 2026');
    await expect(meta).toContainText('Explainer');

    const changes = page.locator('[data-issue-changes][data-variant="desktop"]');
    await expect(changes.locator('[data-change-entry]')).toHaveCount(3);
  });

  test('feed row says "Updated since you read it" only when the read predates the change', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) < 768, 'Uses the desktop sidebar feed.');
    await page.addInitScript(() => {
      try {
        for (const k of Object.keys(localStorage)) if (k.startsWith('tfa')) localStorage.removeItem(k);
        // Finished before the 18 May and 9 Nov 2026 changes.
        localStorage.setItem('tfa:v1:read:1201', JSON.stringify({ state: 'completed', progress: 7, completedAt: '2026-04-01T00:00:00.000Z' }));
        // Never updated after publication.
        localStorage.setItem('tfa:v1:read:2018', JSON.stringify({ state: 'completed', progress: 7, completedAt: '2026-11-08T12:00:00.000Z' }));
        // A completion recorded before completedAt existed: no badge.
        localStorage.setItem('tfa:v1:read:1102', JSON.stringify({ state: 'completed', progress: 7 }));
      } catch { /* ignore */ }
    });
    await page.goto('/');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

    // Completed issues sit in the collapsed "Completed" section.
    const completed = page.locator('[data-section="completed"] button');
    await completed.click();
    await expect(completed).toHaveAttribute('aria-expanded', 'true');

    const badges = page.locator('[data-updated-since-read]');
    await expect(badges).toHaveCount(1);
    const feed = await (await page.request.get('/issues-feed.json')).json();
    const headline = feed.find((i: { id: string }) => i.id === '1201').headline;
    await expect(page.getByRole('option').filter({ has: badges })).toContainText(headline);
    await expect(badges).toHaveText(/Updated since you read it/i);
  });
});
