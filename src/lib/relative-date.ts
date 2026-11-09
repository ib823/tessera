/**
 * Reader-facing dates for feed cards, the lead, the briefing, dossier cards
 * and Library rows (audit H-1).
 *
 * Callers pass an issue's publication day (`publishedDay()` in issue-meta,
 * YYYY-MM-DD in Malaysia time), not `sourceDate`, which moves when sources
 * are re-checked for a correction. Dates are calendar days: an issue dated
 * today reads "Today" at any hour.
 */

const DAY_MS = 86_400_000;

function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** Whole calendar days from `iso` to `now` (local calendar), or null for a bad date. */
export function daysSince(iso: string | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const parts = parseIsoDate(iso);
  if (!parts) return null;
  const then = Date.UTC(parts.y, parts.m - 1, parts.d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - then) / DAY_MS);
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}

/**
 * "Today", "Yesterday", "3 days ago", "2 weeks ago", "7 months ago", "1 year ago".
 * Returns '' when the date is missing or unreadable, so callers can hide the slot.
 */
export function relativeDate(iso: string | null | undefined, now: Date = new Date()): string {
  const days = daysSince(iso, now);
  if (days === null) return '';
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return plural(days, 'day');
  if (days < 31) return plural(Math.floor(days / 7), 'week');

  const parts = parseIsoDate(iso as string)!;
  let months = (now.getFullYear() - parts.y) * 12 + (now.getMonth() + 1 - parts.m);
  if (now.getDate() < parts.d) months -= 1;
  months = Math.max(1, months);
  if (months < 12) return plural(months, 'month');
  return plural(Math.floor(months / 12), 'year');
}

/** "8 April 2026" — the full date, for `title` and `datetime` companions. */
export function absoluteDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const parts = parseIsoDate(iso);
  if (!parts) return '';
  const date = new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Newest of a list of ISO dates (they sort lexically), or '' for none. */
export function newestDate(dates: ReadonlyArray<string | null | undefined>): string {
  let newest = '';
  for (const date of dates) {
    if (date && date > newest) newest = date;
  }
  return newest;
}

/** True when `iso` falls within the last `days` calendar days (today counts). */
export function isWithinDays(iso: string | null | undefined, days: number, now: Date = new Date()): boolean {
  const since = daysSince(iso, now);
  return since !== null && since >= 0 && since < days;
}
