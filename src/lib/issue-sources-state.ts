import type { SourceEntry } from '../data/issue-types';

/**
 * What the Sources block shows for an issue:
 * - 'list'  : the issue has entries on file
 * - 'empty' : no entries, so one quiet "not yet on file" line
 * - 'none'  : no entries and the issue is pre-pipeline (legacyAudit), whose
 *             caveat already says sources are not on file, so nothing renders
 */
export type SourcesState = 'list' | 'empty' | 'none';

export function sourcesState(issue: { legacyAudit?: boolean; sourceList?: SourceEntry[] }): SourcesState {
  if ((issue.sourceList ?? []).length > 0) return 'list';
  return issue.legacyAudit ? 'none' : 'empty';
}
