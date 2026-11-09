import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { setIssueFields } from '../../../scripts/lib/issue-fields.mjs';
import { STORY_TYPES } from '../../data/issue-types';
import {
  describeChange,
  formatIssueDate,
  issueDateTime,
  issueDay,
  publishedDay,
  updatedSinceRead,
  wasUpdated,
} from '../issue-meta';

describe('issue dates', () => {
  it('dates an issue by first publication, falling back to sourceDate', () => {
    expect(publishedDay({ publishedAt: '2026-03-29T22:30:00Z', sourceDate: '2026-11-09' })).toBe('2026-03-30');
    expect(publishedDay({ sourceDate: '2026-04-08' })).toBe('2026-04-08');
    expect(publishedDay({})).toBe('');
  });

  it('reads a date-time as its Malaysia calendar day', () => {
    // 22:30 UTC on 7 April is 06:30 on 8 April in Kuala Lumpur.
    expect(issueDay('2026-04-07T22:30:00Z')).toBe('2026-04-08');
    expect(issueDay('2026-04-08T18:08:24+08:00')).toBe('2026-04-08');
    expect(issueDay('2026-04-08')).toBe('2026-04-08');
    expect(issueDay('not a date')).toBeNull();
    expect(issueDay(undefined)).toBeNull();
  });

  it('formats as d MMM yyyy without locale data', () => {
    expect(formatIssueDate('2026-04-08T18:08:24+08:00')).toBe('8 Apr 2026');
    expect(formatIssueDate('2026-09-19')).toBe('19 Sep 2026');
    expect(formatIssueDate(undefined)).toBe('');
  });

  it('gives bare dates a Malaysia morning time for meta tags', () => {
    expect(issueDateTime('2026-04-08')).toBe('2026-04-08T08:00:00+08:00');
    expect(issueDateTime('2026-04-08T18:08:24+08:00')).toBe('2026-04-08T18:08:24+08:00');
    expect(issueDateTime(undefined)).toBeUndefined();
  });

  it('counts an issue as updated only when the change fell on a later day', () => {
    expect(wasUpdated({ publishedAt: '2026-03-30T14:17:24+08:00', modifiedAt: '2026-05-18T08:46:07+08:00' })).toBe(true);
    expect(wasUpdated({ publishedAt: '2026-05-17T09:00:00+08:00', modifiedAt: '2026-05-17T21:00:00+08:00' })).toBe(false);
    expect(wasUpdated({ publishedAt: '2026-05-17T09:00:00+08:00' })).toBe(false);
  });
});

describe('updated since you read it', () => {
  const issue = { publishedAt: '2026-03-30T14:17:24+08:00', modifiedAt: '2026-05-18T08:46:07+08:00' };

  it('shows when the reader finished before the last change', () => {
    expect(updatedSinceRead(issue, { state: 'completed', completedAt: '2026-04-02T10:00:00.000Z' })).toBe(true);
  });

  it('hides when the reader finished after the change', () => {
    expect(updatedSinceRead(issue, { state: 'completed', completedAt: '2026-05-19T10:00:00.000Z' })).toBe(false);
  });

  it('hides for unfinished reads, completions without a time, and issues never updated', () => {
    expect(updatedSinceRead(issue, { state: 'started' })).toBe(false);
    expect(updatedSinceRead(issue, { state: 'completed' })).toBe(false);
    expect(updatedSinceRead(issue, null)).toBe(false);
    const neverUpdated = { publishedAt: issue.publishedAt, modifiedAt: issue.publishedAt };
    expect(updatedSinceRead(neverUpdated, { state: 'completed', completedAt: '2026-03-01T00:00:00Z' })).toBe(false);
  });
});

describe('change entries', () => {
  it('splits the Correction / Update prefix from the text', () => {
    expect(describeChange({ edition: 2, date: '2026-04-08', summary: 'Correction: Fixed the figure.' })).toEqual({ kind: 'correction', text: 'Fixed the figure.' });
    expect(describeChange({ edition: 3, date: '2026-05-18', summary: 'Update: Added 2025 data.' })).toEqual({ kind: 'update', text: 'Added 2025 data.' });
    expect(describeChange({ edition: 2, date: '2026-04-07', summary: 'First published as edition 2.' })).toEqual({ kind: 'note', text: 'First published as edition 2.' });
  });

  it('capitalises the text after the prefix', () => {
    expect(describeChange({ edition: 4, date: '2026-11-09', summary: 'Correction: the court struck it down.' })).toEqual({ kind: 'correction', text: 'The court struck it down.' });
  });

  it('labels an update that also corrects an error as a correction', () => {
    const c = describeChange({ edition: 3, date: '2026-11-09', summary: 'Update: the case was dismissed. Correction: it was the High Court.' });
    expect(c.kind).toBe('correction');
    expect(c.text).toBe('The case was dismissed. Correction: it was the High Court.');
  });
});

describe('setIssueFields', () => {
  const file = '{\n  "id": "0001",\n  "edition": 1,\n  "related": ["0002"],\n  "sourceDate": "2026-04-01",\n  "cards": []\n}\n';

  it('inserts new fields after sourceDate and keeps the rest of the file as written', () => {
    const out = setIssueFields(file, { publishedAt: '2026-04-02T08:00:00+08:00' });
    expect(out).toBe('{\n  "id": "0001",\n  "edition": 1,\n  "related": ["0002"],\n  "sourceDate": "2026-04-01",\n  "publishedAt": "2026-04-02T08:00:00+08:00",\n  "cards": []\n}\n');
  });

  it('replaces an existing field in place', () => {
    const once = setIssueFields(file, { publishedAt: 'a', modifiedAt: 'b' });
    const twice = setIssueFields(once, { modifiedAt: 'c' });
    expect(JSON.parse(twice)).toMatchObject({ publishedAt: 'a', modifiedAt: 'c' });
    expect(twice.split('\n')).toHaveLength(once.split('\n').length);
  });

  it('adds a comma to the anchor when it was the last property', () => {
    const out = setIssueFields('{\n  "id": "0001",\n  "sourceDate": "2026-04-01"\n}\n', { type: 'Analysis' });
    expect(JSON.parse(out)).toEqual({ id: '0001', sourceDate: '2026-04-01', type: 'Analysis' });
  });
});

describe('published issue data', () => {
  const dir = join(__dirname, '../../data/issues');
  const published = readdirSync(dir)
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
    .filter((i) => i.published === true && i.retired !== true);

  it('every published issue has a publication date, a modification date not before it, and a story type', () => {
    for (const issue of published) {
      expect(issueDay(issue.publishedAt), `${issue.id} publishedAt`).not.toBeNull();
      expect(Date.parse(issue.modifiedAt), `${issue.id} modifiedAt`).toBeGreaterThanOrEqual(Date.parse(issue.publishedAt));
      expect(STORY_TYPES, `${issue.id} type`).toContain(issue.type);
    }
  });

  it('every updated issue explains its edition in changes[]', () => {
    for (const issue of published.filter((i) => i.status === 'updated' || i.edition > 1)) {
      expect(issue.changes?.length, `${issue.id} changes`).toBeGreaterThan(0);
      for (const change of issue.changes) {
        expect(change.edition).toBeLessThanOrEqual(issue.edition);
        expect(change.summary).not.toMatch(/—/);
      }
    }
  });
});
