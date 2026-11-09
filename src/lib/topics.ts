/**
 * Topics: an issue's primary topic is its most common lens across the fact
 * cards (ties go to the lens that appears first). Today's "Browse by Topic"
 * chips and the crawlable /topic/{slug} pages both group by this rule.
 *
 * scripts/lib/topics.mjs mirrors primaryLens/topicSlug for the sitemap build
 * (Node cannot import this file); src/lib/__tests__/topics.test.ts checks
 * that the two agree on every issue.
 */

export interface TopicCard {
  t: string;
  lens?: string;
}

export interface TopicCluster<T> {
  topic: string;
  slug: string;
  count: number;
  issues: T[];
}

export function primaryLens(cards: TopicCard[]): string | null {
  const counts = new Map<string, number>();
  for (const card of cards) {
    if (card.lens) counts.set(card.lens, (counts.get(card.lens) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [lens, count] of counts) {
    if (count > bestCount) {
      best = lens;
      bestCount = count;
    }
  }
  return best;
}

export function topicSlug(lens: string): string {
  return lens
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function topicHref(lens: string): string {
  return `/topic/${topicSlug(lens)}`;
}

/**
 * Every topic with at least one issue, largest first (ties alphabetical).
 * Issues keep their input order inside a topic; callers sort as they need.
 */
export function buildTopicClusters<T extends { cards: TopicCard[] }>(issues: T[]): TopicCluster<T>[] {
  const byTopic = new Map<string, T[]>();
  for (const issue of issues) {
    const lens = primaryLens(issue.cards);
    if (!lens) continue;
    const list = byTopic.get(lens) ?? [];
    list.push(issue);
    byTopic.set(lens, list);
  }
  return [...byTopic.entries()]
    .map(([topic, list]) => ({ topic, slug: topicSlug(topic), count: list.length, issues: list }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}
