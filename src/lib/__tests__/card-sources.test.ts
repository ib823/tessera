import { describe, expect, it } from 'vitest';
import type { SourceEntry } from '../../data/issue-types';
import { cardSources, sourcePublisher } from '../card-sources';

const entry = (n: number, ref: string, extra: Partial<SourceEntry> = {}): SourceEntry => ({
  n,
  ref,
  title: `Document ${ref}`,
  publisher: `Publisher ${ref}`,
  date: null,
  url: `https://example.gov.my/${ref}`,
  primary: true,
  ...extra,
});

const entries = [entry(1, '1'), entry(2, '3'), entry(3, '12a')];

describe('cardSources', () => {
  it('resolves brief refs to entries in the card order', () => {
    expect(cardSources({ t: 'fact', src: ['12a', '1'] }, entries).map((e) => e.n)).toEqual([3, 1]);
  });

  it('skips refs that are not in the list and repeated refs', () => {
    expect(cardSources({ t: 'fact', src: ['2', '3', '3'] }, entries).map((e) => e.ref)).toEqual(['3']);
  });

  it('links hook and fact cards only', () => {
    expect(cardSources({ t: 'hook', src: ['1'] }, entries)).toHaveLength(1);
    expect(cardSources({ t: 'view', src: ['1'] }, entries)).toEqual([]);
    expect(cardSources({ t: 'reframe', src: ['1'] }, entries)).toEqual([]);
  });

  it('is empty without refs or without a source list', () => {
    expect(cardSources({ t: 'fact' }, entries)).toEqual([]);
    expect(cardSources({ t: 'fact', src: ['1'] }, undefined)).toEqual([]);
  });
});

describe('sourcePublisher', () => {
  it('falls back from publisher to host to title', () => {
    expect(sourcePublisher(entry(1, '1'))).toBe('Publisher 1');
    expect(sourcePublisher(entry(1, '1', { publisher: null, url: 'https://www.dosm.gov.my/x' }))).toBe('dosm.gov.my');
    expect(sourcePublisher(entry(1, '1', { publisher: null, url: null }))).toBe('Document 1');
  });
});
