/**
 * Node mirror of primaryLens/topicSlug in src/lib/topics.ts, for build
 * scripts (the sitemap) that cannot import TypeScript. Keep the two in step;
 * src/lib/__tests__/topics.test.ts fails if they disagree on any issue.
 */

/** Most common lens across an issue's cards; ties go to the first one seen. */
export function primaryLens(cards) {
  const counts = new Map();
  for (const card of cards ?? []) {
    if (card?.lens) counts.set(card.lens, (counts.get(card.lens) ?? 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const [lens, count] of counts) {
    if (count > bestCount) {
      best = lens;
      bestCount = count;
    }
  }
  return best;
}

export function topicSlug(lens) {
  return String(lens)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
