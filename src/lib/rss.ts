/**
 * RSS 2.0 feed of published issues (audit S-6), built at build time by
 * src/pages/rss.xml.ts. Also exports the newest-first ordering the 404 page
 * uses for its "Latest issues" list.
 */
import type { Card } from '../data/issue-types';
import { issueDateTime, publishedDay } from './issue-meta';

export interface FeedIssue {
  id: string;
  headline: string;
  context: string;
  sourceDate?: string;
  publishedAt?: string;
  published?: boolean;
  retired?: boolean;
  cards: Pick<Card, 't' | 'lens'>[];
}

export const FEED_TITLE = 'FORA';
export const FEED_DESCRIPTION =
  'Bite-size analysis of Malaysian issues: what the headline said, what the record shows, and the question worth asking.';

/** Published, unretired issues, newest first (by publication day, then id). */
export function latestIssues<T extends FeedIssue>(issues: readonly T[], limit = Infinity): T[] {
  return issues
    .filter((issue) => issue.published === true && issue.retired !== true)
    .sort((a, b) => publishedDay(b).localeCompare(publishedDay(a)) || b.id.localeCompare(a.id))
    .slice(0, limit);
}

/**
 * Same publication time the issue page emits as article:published_time:
 * `publishedAt`, else `sourceDate`; a bare date means 08:00 Malaysia time.
 */
export function issuePublishedDate(issue: { publishedAt?: string; sourceDate?: string }): Date | null {
  const iso = issueDateTime(issue.publishedAt ?? issue.sourceDate);
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lensesOf(issue: FeedIssue): string[] {
  const seen = new Set<string>();
  for (const card of issue.cards) {
    if (card.t === 'fact' && card.lens) seen.add(card.lens);
  }
  return [...seen];
}

export function buildRssXml(issues: readonly FeedIssue[], siteUrl: string): string {
  const site = siteUrl.replace(/\/$/, '');
  const items = latestIssues(issues);
  const newest = items.map((issue) => issuePublishedDate(issue)).find((d): d is Date => d !== null);

  const itemXml = items
    .map((issue) => {
      const url = `${site}/issue/${issue.id}`;
      const date = issuePublishedDate(issue);
      const lines = [
        '    <item>',
        `      <title>${escapeXml(issue.headline)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(issue.context)}</description>`,
        ...(date ? [`      <pubDate>${date.toUTCString()}</pubDate>`] : []),
        ...lensesOf(issue).map((lens) => `      <category>${escapeXml(lens)}</category>`),
        '    </item>',
      ];
      return lines.join('\n');
    })
    .join('\n');

  // lastBuildDate follows the newest issue rather than the clock, so a rebuild
  // with no new issue produces the same feed.
  const channelDate = newest ? [`    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>`] : [];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(FEED_TITLE)}</title>`,
    `    <link>${site}/</link>`,
    `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
    '    <language>en-MY</language>',
    `    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />`,
    ...channelDate,
    '    <image>',
    `      <url>${site}/logo.png</url>`,
    `      <title>${escapeXml(FEED_TITLE)}</title>`,
    `      <link>${site}/</link>`,
    '    </image>',
    itemXml,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
