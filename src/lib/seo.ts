/**
 * Search-result titles for issue pages.
 *
 * Results pages cut titles at roughly 60 characters, and 92 of 92 issue
 * headlines ran past that (audit S-4). An issue may set `seoTitle` to choose
 * its own short title; otherwise the headline is shortened at a word
 * boundary. The on-page headline is never changed.
 */

export const SEO_TITLE_MAX = 60;
export const SITE_NAME = 'The Fourth Angle';
const BRAND_SUFFIX = ` | ${SITE_NAME}`;
const ELLIPSIS = '…';

// Words a shortened title should not end on: they promise a continuation.
const DANGLING = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'is', 'its', 'of', 'on', 'or',
  'over', 'the', 'their', 'to', 'vs', 'was', 'were', 'what', 'when', 'where', 'which', 'who', 'why', 'with',
]);

function trimTail(text: string): string {
  // Drop trailing punctuation and spaces left behind by the cut.
  return text.replace(/[\s,;:\-–—.(/'"‘“]+$/u, '');
}

/**
 * Shorten `text` to at most `max` characters without cutting a word.
 * When it has to shorten, it ends on a whole word followed by an ellipsis.
 */
export function truncateAtWord(text: string, max: number = SEO_TITLE_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;

  const words = clean.split(' ');
  const kept: string[] = [];
  let length = 0;
  for (const word of words) {
    const next = length === 0 ? word.length : length + 1 + word.length;
    // Leave room for the ellipsis.
    if (next > max - ELLIPSIS.length) break;
    kept.push(word);
    length = next;
  }

  // A single word longer than the limit: keep it whole rather than cut it.
  if (kept.length === 0) return clean.split(' ')[0];

  while (kept.length > 1 && DANGLING.has(trimTail(kept[kept.length - 1]).toLowerCase())) kept.pop();
  return `${trimTail(kept.join(' '))}${ELLIPSIS}`;
}

/** The short title for an issue: its `seoTitle` override, or the shortened headline. */
export function issueSeoTitle(issue: { headline: string; seoTitle?: string }): string {
  const override = issue.seoTitle?.replace(/\s+/g, ' ').trim();
  if (override) return override.length <= SEO_TITLE_MAX ? override : truncateAtWord(override);
  return truncateAtWord(issue.headline);
}

/** The document <title>: the short title, plus the site name when it still fits in 60 characters. */
export function issueDocumentTitle(issue: { headline: string; seoTitle?: string }): string {
  const short = issueSeoTitle(issue);
  return short.length + BRAND_SUFFIX.length <= SEO_TITLE_MAX ? `${short}${BRAND_SUFFIX}` : short;
}
