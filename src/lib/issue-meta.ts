/**
 * Publication-date helpers shared by the static article, the readers and the
 * feed rows.
 *
 * Issue dates (`publishedAt`, `modifiedAt`) are ISO dates (YYYY-MM-DD) or ISO
 * date-times with an offset. Readers see them as Malaysia calendar dates.
 */
import type { IssueChange } from '../data/issue-types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const MYT_OFFSET_MS = 8 * 3600 * 1000;

/** Malaysia calendar date (YYYY-MM-DD) of an issue date, or null if unparseable. */
export function issueDay(value: string | null | undefined): string | null {
  if (!value) return null;
  if (DATE_ONLY.test(value)) return value;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  return new Date(t + MYT_OFFSET_MS).toISOString().slice(0, 10);
}

/** "8 Apr 2026". Fixed English month names, not Intl, so output never varies by locale or ICU. */
export function formatIssueDate(value: string | null | undefined): string {
  const day = issueDay(value);
  if (!day) return '';
  const [y, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Full ISO date-time for meta tags and JSON-LD. A bare date means 08:00 Malaysia time. */
export function issueDateTime(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return DATE_ONLY.test(value) ? `${value}T08:00:00+08:00` : value;
}

interface Dated {
  publishedAt?: string;
  modifiedAt?: string;
}

/** True when the issue changed on a later day than it was first published. */
export function wasUpdated(issue: Dated): boolean {
  const published = issueDay(issue.publishedAt);
  const modified = issueDay(issue.modifiedAt);
  return !!published && !!modified && modified > published;
}

/**
 * True when the reader finished the issue before its last substantive change.
 * Needs `completedAt` on the read state, recorded since this badge shipped;
 * older completions carry none and never show the badge.
 */
export function updatedSinceRead(
  issue: Dated,
  readState: { state: string; completedAt?: string } | null | undefined,
): boolean {
  if (readState?.state !== 'completed' || !readState.completedAt || !wasUpdated(issue)) return false;
  const completed = Date.parse(readState.completedAt);
  const modified = Date.parse(issueDateTime(issue.modifiedAt) ?? '');
  return !Number.isNaN(completed) && !Number.isNaN(modified) && completed < modified;
}

/** A change entry, split into its kind and the text after the "Correction:" / "Update:" prefix. */
export function describeChange(change: IssueChange): { kind: 'correction' | 'update' | 'note'; text: string } {
  const m = change.summary.match(/^(Correction|Update):\s*/);
  if (!m) return { kind: 'note', text: change.summary };
  const rest = change.summary.slice(m[0].length);
  const text = rest.charAt(0).toUpperCase() + rest.slice(1);
  // An "Update: … Correction: …" entry also corrects an error, so it is labelled a correction.
  const corrects = m[1] === 'Correction' || /\bCorrection:/.test(rest);
  return { kind: corrects ? 'correction' : 'update', text };
}
