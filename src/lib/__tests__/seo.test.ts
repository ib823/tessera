import { describe, expect, it } from 'vitest';
import { ISSUES } from '../../data/issues';
import { issueDocumentTitle, issueSeoTitle, SEO_TITLE_MAX, truncateAtWord } from '../seo';

describe('truncateAtWord', () => {
  it('leaves short text alone', () => {
    expect(truncateAtWord('EPF withdrawals and the gig economy', 60)).toBe('EPF withdrawals and the gig economy');
  });

  it('cuts at a word boundary and marks the cut', () => {
    const out = truncateAtWord('Malaysia counts 1.2 million gig workers but the definition leaves out most riders', 40);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out.endsWith('…')).toBe(true);
    expect('Malaysia counts 1.2 million gig workers but the definition'.startsWith(out.slice(0, -1))).toBe(true);
  });

  it('never ends on a dangling short word or punctuation', () => {
    const out = truncateAtWord('Penang flood mitigation spending, as of the 2025 audit, missed its targets again', 34);
    expect(out).toBe('Penang flood mitigation spending…');
  });

  it('keeps a single overlong word whole instead of cutting it', () => {
    expect(truncateAtWord('Supercalifragilistic', 10)).toBe('Supercalifragilistic');
  });
});

describe('issue titles', () => {
  it('prefers an seoTitle override', () => {
    expect(issueSeoTitle({ headline: 'A very long headline '.repeat(5), seoTitle: 'Gig workers and EPF' })).toBe('Gig workers and EPF');
  });

  it('adds the site name only when it still fits', () => {
    expect(issueDocumentTitle({ headline: 'Gig workers and EPF' })).toBe('Gig workers and EPF | FORA');
    const long = issueDocumentTitle({ headline: 'Malaysia counts 1.2 million gig workers but the definition leaves out most riders' });
    expect(long.length).toBeLessThanOrEqual(SEO_TITLE_MAX);
    expect(long).not.toContain(' | FORA');
  });

  it('keeps every published issue title within 60 characters without splitting a word', () => {
    for (const issue of ISSUES.filter((i) => i.published === true)) {
      const title = issueDocumentTitle(issue);
      expect(title.length, `${issue.id}: ${title}`).toBeLessThanOrEqual(SEO_TITLE_MAX);
      // The site name follows a shortened title when both fit, so drop it first.
      const stem = title.replace(/ \| FORA$/, '').replace(/…$/, '');
      const source = (issue.seoTitle ?? issue.headline).replace(/\s+/g, ' ').trim();
      expect(source.startsWith(stem), `${issue.id}: "${stem}" is not a prefix of the headline`).toBe(true);
      const nextChar = source.charAt(stem.length);
      expect(nextChar === '' || /[\s,;:.\-–—!?)'"’”]/u.test(nextChar), `${issue.id}: cut mid-word after "${stem}"`).toBe(true);
    }
  });
});
