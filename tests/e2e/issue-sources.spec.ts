import { test, expect } from '@playwright/test';

/**
 * Sources block on issue pages. Follows ssg-article.spec.ts: assertions run on
 * the raw HTML (and the per-issue JSON the interactive readers load), so they
 * do not depend on the App island hydrating in headless CI.
 *
 * Selectors are repo-owned data-* attributes, which scripts/stealth.mjs keeps.
 * Issue 2017's list comes from engine/briefs/malaysian-crude-iran-blockade-gap.md.
 */

function sourcesSection(html: string): string {
  const start = html.indexOf('data-issue-sources');
  expect(start, 'Sources block present in the static article').toBeGreaterThan(-1);
  const open = html.lastIndexOf('<section', start);
  const close = html.indexOf('</section>', start);
  return html.slice(open, close);
}

test.describe('Issue sources', () => {
  test('/issue/2017 raw HTML lists at least 8 sources, one or more marked primary', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/issue/2017`);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();

    // Inside the static <article>, so it works without JS.
    const article = html.slice(html.indexOf('<article'), html.indexOf('</article>'));
    const section = sourcesSection(article);

    const entries = [...section.matchAll(/data-source-entry\b/g)].length;
    expect(entries).toBeGreaterThanOrEqual(8);
    expect(section).toMatch(new RegExp(`data-source-count="${entries}"`));
    expect(section).toMatch(new RegExp(`>Sources \\(${entries}\\)<`));

    expect([...section.matchAll(/data-primary="true"/g)].length).toBeGreaterThanOrEqual(1);
    expect(section).toMatch(/>Primary</);

    // Collapsible: a native <details>, collapsed on the static article.
    expect(section).toMatch(/<details(?![^>]*\bopen\b)[^>]*>/);
    expect(section).toMatch(/<ol\b/);

    // Every source link opens in a new tab without leaking the opener.
    const anchors = [...section.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
    expect(anchors.length).toBeGreaterThan(0);
    for (const a of anchors) {
      expect(a).toMatch(/target="_blank"/);
      expect(a).toMatch(/rel="noopener noreferrer"/);
      expect(a).toMatch(/href="https?:\/\//);
    }
  });

  test('/issues/2017.json carries the list for the interactive readers', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/issues/2017.json`);
    expect(response.ok()).toBeTruthy();
    const issue = await response.json();
    expect(Array.isArray(issue.sourceList)).toBe(true);
    expect(issue.sourceList.length).toBeGreaterThanOrEqual(8);
    expect(issue.sourceList.some((e: { primary: boolean }) => e.primary)).toBe(true);
    for (const [i, e] of issue.sourceList.entries()) {
      expect(e.n).toBe(i + 1);
      expect(typeof e.title).toBe('string');
    }
  });

  test('an issue without a source list on file shows one quiet line', async ({ request, baseURL }) => {
    // 0146 is published, not pre-pipeline, and has no brief linked in engine/output.
    const response = await request.get(`${baseURL}/issue/0146`);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('data-issue-sources-empty');
    expect(html).toContain('Source list not yet on file for this issue.');
    expect(html).not.toMatch(/data-source-entry\b/);
  });
});
