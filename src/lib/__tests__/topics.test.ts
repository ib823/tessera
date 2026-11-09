import { describe, it, expect } from 'vitest';
import { buildTopicClusters, primaryLens, topicHref, topicSlug } from '../topics';
import * as nodeTopics from '../../../scripts/lib/topics.mjs';
import { loadIssues } from '../../../scripts/lib/load-issues.mjs';

const issue = (id: string, lenses: string[]) => ({
  id,
  cards: [{ t: 'hook' }, ...lenses.map((lens) => ({ t: 'fact', lens })), { t: 'view' }],
});

describe('primaryLens', () => {
  it('picks the most common lens', () => {
    expect(primaryLens(issue('a', ['Legal', 'Economic', 'Economic']).cards)).toBe('Economic');
  });

  it('breaks ties by first appearance', () => {
    expect(primaryLens(issue('a', ['Social', 'Legal', 'Economic']).cards)).toBe('Social');
  });

  it('returns null when no card has a lens', () => {
    expect(primaryLens([{ t: 'hook' }, { t: 'view' }])).toBeNull();
  });
});

describe('topic slugs', () => {
  it('lowercases and hyphenates', () => {
    expect(topicSlug('Legal')).toBe('legal');
    expect(topicSlug('Public Health')).toBe('public-health');
    expect(topicHref('Economic')).toBe('/topic/economic');
  });
});

describe('buildTopicClusters', () => {
  it('lists every topic, and the counts add up to every issue with a lens', () => {
    const issues = [
      issue('1', ['Legal', 'Legal', 'Social']),
      issue('2', ['Economic', 'Economic', 'Legal']),
      issue('3', ['Legal', 'Rights', 'Legal']),
      issue('4', ['Regional', 'Historical', 'Social']),
      { id: '5', cards: [{ t: 'hook' }] },
    ];
    const clusters = buildTopicClusters(issues);
    expect(clusters.map((c) => c.topic)).toEqual(['Legal', 'Economic', 'Regional']);
    expect(clusters.reduce((sum, c) => sum + c.count, 0)).toBe(4);
    expect(clusters[0]).toMatchObject({ slug: 'legal', count: 2 });
  });
});

describe('Node mirror for the sitemap', () => {
  it('agrees with src/lib/topics.ts on every issue', () => {
    for (const record of loadIssues()) {
      const lens = primaryLens(record.cards);
      expect(nodeTopics.primaryLens(record.cards), record.id).toBe(lens);
      if (lens) expect(nodeTopics.topicSlug(lens), record.id).toBe(topicSlug(lens));
    }
  });
});
