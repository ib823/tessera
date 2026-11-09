/**
 * "Continue: related" on the reader's completion screen (audit A-8).
 *
 * "Next topic" used to open whatever came next in the feed order, which is
 * usually unrelated (Gig Workers led to LCS ships). The fact graph and each
 * issue's curated `related` list already know what connects, so the reader
 * now offers a related issue first and keeps the feed order ("Latest") as the
 * second option.
 */
import { getConnections, loadFactGraph, loadFeedIssues } from './issues-loader';
import { getReadState } from '../stores/reader';

export interface GraphLink {
  id: string;
  weight: number;
  sharedEntities: string[];
}

export interface RelatedPick {
  id: string;
  headline: string;
  /** Entities the two issues share in the fact graph (may be empty for curated links). */
  sharedEntities: string[];
}

interface PickInput {
  issueId: string;
  /** The issue's curated `related` ids, in editorial order. */
  related?: string[];
  /** Fact-graph connections for the issue. */
  graph?: GraphLink[];
  /** Published issues, for headlines and to skip anything unpublished. */
  feed: Array<{ id: string; headline: string }>;
  /** True when the reader has already finished that issue. */
  isCompleted?: (id: string) => boolean;
}

/**
 * Curated links first (an editor chose them), then fact-graph links by
 * weight. Unread issues win over finished ones; if everything is finished,
 * the strongest link is still offered.
 */
export function pickRelatedIssue({ issueId, related = [], graph = [], feed, isCompleted = () => false }: PickInput): RelatedPick | null {
  const headlines = new Map(feed.map((entry) => [entry.id, entry.headline]));
  const shared = new Map(graph.map((link) => [link.id, link.sharedEntities]));
  const byWeight = [...graph].sort((a, b) => b.weight - a.weight).map((link) => link.id);

  const seen = new Set<string>([issueId]);
  const candidates: RelatedPick[] = [];
  for (const id of [...related, ...byWeight]) {
    if (seen.has(id)) continue;
    seen.add(id);
    const headline = headlines.get(id);
    if (!headline) continue;
    candidates.push({ id, headline, sharedEntities: shared.get(id) ?? [] });
  }
  return candidates.find((c) => !isCompleted(c.id)) ?? candidates[0] ?? null;
}

/** Resolve the related pick for an issue from the cached feed and fact graph. */
export async function resolveRelatedIssue(issue: { id: string; related?: string[] }): Promise<RelatedPick | null> {
  try {
    const [feed] = await Promise.all([loadFeedIssues(), loadFactGraph()]);
    return pickRelatedIssue({
      issueId: issue.id,
      related: issue.related,
      graph: getConnections(issue.id),
      feed,
      isCompleted: (id) => getReadState(id)?.state === 'completed',
    });
  } catch {
    return null;
  }
}
