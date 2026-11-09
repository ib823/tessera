import { describe, expect, it } from 'vitest';
import { buildRssXml, escapeXml, issuePublishedDate, latestIssues } from '../rss';
import { ISSUES } from '../../data/issues';

const card = (t: 'hook' | 'fact' | 'view', lens?: string) => ({ t, lens });

const sample = [
  { id: '0001', headline: 'Older issue', context: 'Older context.', sourceDate: '2026-04-08', published: true, cards: [card('hook'), card('fact', 'Legal')] },
  { id: '0003', headline: 'Draft issue', context: 'Not out yet.', sourceDate: '2026-11-01', published: false, cards: [card('hook')] },
  { id: '0002', headline: 'Rates & "risk" <now>', context: 'Newer context.', sourceDate: '2026-05-17', published: true, cards: [card('fact', 'Economic'), card('fact', 'Economic'), card('fact', 'Social')] },
  { id: '0004', headline: 'Retired issue', context: 'Gone.', sourceDate: '2026-06-01', published: true, retired: true, cards: [card('hook')] },
  { id: '0005', headline: 'Same day, higher id', context: 'Tie break.', sourceDate: '2026-05-17', published: true, cards: [card('view')] },
];

describe('latestIssues', () => {
  it('keeps published, unretired issues, newest first with id as the tie break', () => {
    expect(latestIssues(sample).map((i) => i.id)).toEqual(['0005', '0002', '0001']);
    expect(latestIssues(sample, 2).map((i) => i.id)).toEqual(['0005', '0002']);
  });
});

describe('buildRssXml', () => {
  const xml = buildRssXml(sample, 'https://example.test/');

  it('is an RSS 2.0 channel with a self link', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"')).toBe(true);
    expect(xml).toContain('<atom:link href="https://example.test/rss.xml" rel="self" type="application/rss+xml" />');
    expect(xml).toContain('<language>en-MY</language>');
  });

  it('lists items newest first with permalinks and publication dates', () => {
    const links = [...xml.matchAll(/<link>(https:\/\/example\.test\/issue\/\d+)<\/link>/g)].map((m) => m[1]);
    expect(links).toEqual(['https://example.test/issue/0005', 'https://example.test/issue/0002', 'https://example.test/issue/0001']);
    expect(xml).toContain('<guid isPermaLink="true">https://example.test/issue/0002</guid>');
    expect(xml).toContain(`<pubDate>${issuePublishedDate('2026-05-17')!.toUTCString()}</pubDate>`);
    expect(xml).toContain(`<lastBuildDate>${issuePublishedDate('2026-05-17')!.toUTCString()}</lastBuildDate>`);
  });

  it('escapes text and lists each fact lens once', () => {
    expect(xml).toContain('<title>Rates &amp; &quot;risk&quot; &lt;now&gt;</title>');
    expect(xml.match(/<category>Economic<\/category>/g)).toHaveLength(1);
    expect(xml).toContain('<category>Social</category>');
    expect(xml).not.toContain('Draft issue');
    expect(xml).not.toContain('Retired issue');
  });

  it('dates issues at 08:00 Malaysia time, matching article:published_time', () => {
    expect(issuePublishedDate('2026-04-08')!.toISOString()).toBe('2026-04-08T00:00:00.000Z');
    expect(issuePublishedDate('not-a-date')).toBeNull();
  });

  it('covers every published issue in the real data', () => {
    const real = buildRssXml(ISSUES, 'https://thefourthangle.pages.dev');
    const published = ISSUES.filter((i) => i.published === true && i.retired !== true);
    expect(real.match(/<item>/g)).toHaveLength(published.length);
  });
});

describe('escapeXml', () => {
  it('escapes the five XML specials', () => {
    expect(escapeXml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;');
  });
});
