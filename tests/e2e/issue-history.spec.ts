import { test, expect } from '@playwright/test';

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
 * 18 May 2026 (edition 3, Explainer). 2018 was published on 8 Nov 2026 and
 * never changed (Explainer). Dates come from scripts/derive-issue-history.mjs.
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
    expect(meta).toMatch(/Updated <time datetime="2026-05-18T08:46:05\+08:00"[^>]*>18 May 2026<\/time>/);
    expect(meta).toContain('data-story-type="Explainer"');
    // The line sits directly under the headline.
    expect(article.indexOf('data-issue-meta')).toBeGreaterThan(article.indexOf('id="ssg-headline"'));
    expect(article.indexOf('data-issue-meta')).toBeLessThan(article.indexOf('<figure'));

    const changes = slice(article, 'data-issue-changes', 'section');
    expect(changes).toContain('data-change-count="2"');
    expect(changes).toMatch(/>What changed \(2\)</);
    expect([...changes.matchAll(/data-change-entry\b/g)]).toHaveLength(2);
    // Newest first, corrections labelled.
    expect(changes.indexOf('Edition 3')).toBeLessThan(changes.indexOf('Edition 2'));
    expect([...changes.matchAll(/data-change-kind="correction"/g)]).toHaveLength(2);
    expect(changes).toMatch(/>Correction</);
    // Placed after the Sources block, as a native <details> collapsed on the static article.
    expect(article.indexOf('data-issue-changes')).toBeGreaterThan(article.indexOf('data-issue-sources'));
    expect(changes).toMatch(/<details(?![^>]*\bopen\b)[^>]*>/);
  });

  test('/issue/1201 head carries matching article:* times and JSON-LD dates', async ({ request, baseURL }) => {
    const html = await (await request.get(`${baseURL}/issue/1201`)).text();
    expect(html).toContain('<meta property="article:published_time" content="2026-03-30T14:17:24+08:00"');
    expect(html).toContain('<meta property="article:modified_time" content="2026-05-18T08:46:05+08:00"');
    expect(html).toContain('<meta property="article:section" content="Explainer"');

    const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(ld).not.toBeNull();
    const data = JSON.parse(ld![1]);
    expect(data.datePublished).toBe('2026-03-30T14:17:24+08:00');
    expect(data.dateModified).toBe('2026-05-18T08:46:05+08:00');
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
    expect(row).toMatchObject({ publishedAt: '2026-03-30T14:17:24+08:00', modifiedAt: '2026-05-18T08:46:05+08:00', type: 'Explainer' });
    expect(row.changes).toBeUndefined();

    const issue = await (await request.get(`${baseURL}/issues/1201.json`)).json();
    expect(issue.changes).toHaveLength(2);
    expect(issue.changes[1]).toMatchObject({ edition: 3, date: '2026-05-18' });
  });

  test('sitemap lastmod follows modifiedAt', async ({ request, baseURL }) => {
    const xml = await (await request.get(`${baseURL}/sitemap.xml`)).text();
    expect(xml).toMatch(/<loc>[^<]*\/issue\/1201<\/loc>\s*<lastmod>2026-05-18T08:46:05\+08:00<\/lastmod>/);
    expect(xml).toMatch(/<loc>[^<]*\/issue\/2018<\/loc>\s*<lastmod>2026-11-08T18:37:13\+08:00<\/lastmod>/);
  });

  test('desktop reader shows the meta line and an open What changed block', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) < 768, 'Desktop reader only; the mobile reader is covered by the raw-HTML tests.');
    await page.goto('/issue/1201');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

    const meta = page.locator('[data-issue-meta][data-variant="desktop"]');
    await expect(meta).toBeVisible();
    await expect(meta).toContainText('Published 30 Mar 2026');
    await expect(meta).toContainText('Updated 18 May 2026');
    await expect(meta).toContainText('Explainer');

    const changes = page.locator('[data-issue-changes][data-variant="desktop"]');
    await expect(changes.locator('[data-change-entry]')).toHaveCount(2);
  });

  test('feed row says "Updated since you read it" only when the read predates the change', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) < 768, 'Uses the desktop sidebar feed.');
    await page.addInitScript(() => {
      try {
        for (const k of Object.keys(localStorage)) if (k.startsWith('tfa')) localStorage.removeItem(k);
        // Finished before the 18 May 2026 correction.
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
