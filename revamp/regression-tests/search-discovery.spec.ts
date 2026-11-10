import { test, expect } from '@playwright/test';

/**
 * Search discovery: every indexable editorial route is in the sitemap, and
 * every issue page ships article structured data. Raw-HTML checks only, so
 * they hold for crawlers that never run JavaScript.
 */

interface FeedEntry {
  id: string;
  headline: string;
  context: string;
  sourceDate?: string | null;
  publishedAt?: string;
  modifiedAt?: string;
}

test.describe('Search discovery', () => {
  test('sitemap lists dossiers, the verifier and every published issue', async ({ request, baseURL }) => {
    const sitemap = await (await request.get(`${baseURL}/sitemap.xml`)).text();
    const locs = [...sitemap.matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);

    expect(locs).toContain('/verify');
    expect(locs).toEqual(expect.arrayContaining(['/dossier/D001', '/dossier/D002']));

    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    for (const issue of feed) expect(locs).toContain(`/issue/${issue.id}`);

    // Every listed dossier route is actually built.
    for (const loc of locs.filter((l) => l.startsWith('/dossier/'))) {
      expect((await request.get(`${baseURL}${loc}`)).ok(), loc).toBeTruthy();
    }
  });

  test('issue page carries NewsArticle JSON-LD matching the issue', async ({ request, baseURL }) => {
    const feed = (await (await request.get(`${baseURL}/issues-feed.json`)).json()) as FeedEntry[];
    const issue = feed[0];
    const html = await (await request.get(`${baseURL}/issue/${issue.id}`)).text();

    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const article = blocks.find((b) => b['@type'] === 'NewsArticle');
    expect(article, 'NewsArticle JSON-LD block').toBeTruthy();

    expect(article.headline).toBe(issue.headline);
    expect(article.description).toBe(issue.context);
    expect(article.url).toMatch(new RegExp(`/issue/${issue.id}$`));
    expect(article.image[0].url).toMatch(new RegExp(`/og/issue-${issue.id}\\.png`));
    // FORA is the brand; The Fourth Angle is the name it is short for ("Names" in CLAUDE.md).
    expect(article.publisher.name).toBe('FORA');
    expect(article.publisher.alternateName).toBe('The Fourth Angle');
    expect(article.author.name).toBe('FORA');
    // Dates come from the issue's publication history (scripts/derive-issue-history.mjs),
    // the same values the page shows as "Published" and "Updated".
    expect(issue.publishedAt, 'published issue has publishedAt').toBeTruthy();
    expect(article.datePublished.startsWith(issue.publishedAt!)).toBe(true);
    expect(article.dateModified.startsWith(issue.modifiedAt ?? issue.publishedAt!)).toBe(true);
  });
});
