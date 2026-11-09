import { describe, expect, it } from 'vitest';
import { sourcesState } from '../issue-sources-state';

const entry = { n: 1, ref: '1', title: 'A document', publisher: null, date: null, url: null, primary: true };

describe('sourcesState', () => {
  it('shows the list when entries are on file', () => {
    expect(sourcesState({ sourceList: [entry] })).toBe('list');
    expect(sourcesState({ legacyAudit: true, sourceList: [entry] })).toBe('list');
  });

  it('shows the quiet empty line for a pipeline issue with no entries', () => {
    expect(sourcesState({})).toBe('empty');
    expect(sourcesState({ sourceList: [] })).toBe('empty');
    expect(sourcesState({ legacyAudit: false, sourceList: [] })).toBe('empty');
  });

  it('renders nothing for a pre-pipeline issue with no entries', () => {
    expect(sourcesState({ legacyAudit: true })).toBe('none');
    expect(sourcesState({ legacyAudit: true, sourceList: [] })).toBe('none');
  });
});
