import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { cardAnchor, cardIndexFromHash, issueShareUrl } from '../card-anchor';
import { pickRelatedIssue } from '../related-next';
import { readMinutes } from '../read-time';
import { formatStampDate, shareCardStamp } from '../share-card';
import { buildVerificationText } from '../verification-text.mjs';
import { ISSUES } from '../../data/issues';

describe('card anchors', () => {
  it('numbers cards from 1 in the URL', () => {
    expect(cardAnchor(0)).toBe('card-1');
    expect(cardAnchor(6)).toBe('card-7');
  });

  it('reads #card-N back to a 0-based index', () => {
    expect(cardIndexFromHash('#card-3', 7)).toBe(2);
    expect(cardIndexFromHash('#card-7', 7)).toBe(6);
  });

  it('ignores anchors for cards the issue does not have', () => {
    expect(cardIndexFromHash('#card-0', 7)).toBeNull();
    expect(cardIndexFromHash('#card-8', 7)).toBeNull();
    expect(cardIndexFromHash('#main-content', 7)).toBeNull();
    expect(cardIndexFromHash('', 7)).toBeNull();
  });

  it('builds issue and card share URLs', () => {
    expect(issueShareUrl('https://x.test', '0146', null)).toBe('https://x.test/issue/0146');
    expect(issueShareUrl('https://x.test', '0146', 2, 'b1')).toBe('https://x.test/issue/0146?v=b1#card-3');
  });
});

describe('share image stamp', () => {
  it('formats the issue date without locale drift', () => {
    expect(formatStampDate('2026-04-08')).toBe('8 Apr 2026');
    expect(formatStampDate('2026-11-30')).toBe('30 Nov 2026');
    expect(formatStampDate(undefined)).toBe('');
    expect(formatStampDate('2026-13-01')).toBe('');
  });

  it('carries date, edition and a short link to the card', () => {
    expect(shareCardStamp({ issueId: '0146', edition: 2, sourceDate: '2026-04-08', cardIndex: 2 })).toEqual({
      line: '8 Apr 2026 \u00B7 Edition 2',
      url: 'thefourthangle.pages.dev/issue/0146#card-3',
    });
    expect(shareCardStamp({ issueId: '0146', cardIndex: null })).toEqual({
      line: '',
      url: 'thefourthangle.pages.dev/issue/0146',
    });
  });
});

describe('pickRelatedIssue', () => {
  const feed = [
    { id: '0146', headline: 'Gig workers' },
    { id: '1128', headline: 'EPF withdrawals' },
    { id: '1500', headline: 'DOSM labour survey' },
    { id: '1600', headline: 'LCS ships' },
  ];

  it('prefers the curated related list over the fact graph', () => {
    const pick = pickRelatedIssue({
      issueId: '0146',
      related: ['1500'],
      graph: [{ id: '1128', weight: 4, sharedEntities: ['EPF', 'DOSM'] }],
      feed,
    });
    expect(pick?.id).toBe('1500');
  });

  it('falls back to the strongest fact-graph link and carries its shared entities', () => {
    const pick = pickRelatedIssue({
      issueId: '0146',
      graph: [
        { id: '1500', weight: 2, sharedEntities: ['DOSM'] },
        { id: '1128', weight: 3, sharedEntities: ['EPF', 'DOSM'] },
      ],
      feed,
    });
    expect(pick).toEqual({ id: '1128', headline: 'EPF withdrawals', sharedEntities: ['EPF', 'DOSM'] });
  });

  it('skips finished issues while an unread one exists, and never offers itself or unpublished ids', () => {
    const pick = pickRelatedIssue({
      issueId: '0146',
      related: ['0146', '9999', '1128', '1500'],
      feed,
      isCompleted: (id) => id === '1128',
    });
    expect(pick?.id).toBe('1500');
  });

  it('still offers the strongest link when every candidate is finished', () => {
    const pick = pickRelatedIssue({ issueId: '0146', related: ['1128', '1500'], feed, isCompleted: () => true });
    expect(pick?.id).toBe('1128');
  });

  it('returns null when nothing connects', () => {
    expect(pickRelatedIssue({ issueId: '0146', feed })).toBeNull();
  });
});

describe('readMinutes', () => {
  it('uses about 230 words a minute', () => {
    expect(readMinutes(1900)).toBe(8);
    expect(readMinutes(4520)).toBe(20);
  });

  it('never reports less than a minute', () => {
    expect(readMinutes(40)).toBe(1);
    expect(readMinutes(0)).toBe(1);
  });
});

describe('buildVerificationText', () => {
  const sevenCard = ISSUES.find((i) => i.published === true && i.cards.length === 7 && i.cards.some((c) => c.t === 'analogy'));

  it('labels analogy cards and counts the real number of cards', () => {
    expect(sevenCard).toBeTruthy();
    const text = buildVerificationText(sevenCard!);
    expect(text).toContain('\nThink of it this way\n');
    expect(text).toContain('\nAll 7 perspectives read\n');
    expect(text.startsWith(`${sevenCard!.headline}\n${sevenCard!.context}\n`)).toBe(true);
  });

  it('is the same function the build signs with', () => {
    const signer = readFileSync(new URL('../../../scripts/sign-content.mjs', import.meta.url), 'utf8');
    expect(signer).toMatch(/import \{ buildVerificationText \} from '..\/src\/lib\/verification-text\.mjs'/);
    expect(signer).not.toMatch(/function buildReadableText/);
  });

  it('survives the /verify page normalisation unchanged for every published issue', () => {
    // public/verify.html trims each line and collapses blank runs before
    // hashing; the build hashes the raw text. They must agree.
    const normalize = (raw: string) => raw.split('\n').map((l) => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    for (const issue of ISSUES.filter((i) => i.published === true)) {
      const text = buildVerificationText(issue);
      expect(normalize(text), issue.id).toBe(text);
    }
  });

  it('produces stable fingerprints', () => {
    const a = createHash('sha256').update(buildVerificationText(sevenCard!)).digest('hex');
    const b = createHash('sha256').update(buildVerificationText(structuredClone(sevenCard!))).digest('hex');
    expect(a).toBe(b);
  });
});
