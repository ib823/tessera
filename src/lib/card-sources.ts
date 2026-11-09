/**
 * Per-card source links (audit P0-2): a hook or fact card lists, in `src`, the
 * refs of the source-list entries that support it. Shared by the desktop
 * reader, the mobile reader and the static article.
 */
import type { Card, SourceEntry } from '../data/issue-types';

/** The entries a card cites, in the card's order. Refs that do not resolve are skipped; the build rejects them. */
export function cardSources(
  card: Pick<Card, 't' | 'src'>,
  entries: readonly SourceEntry[] | null | undefined,
): SourceEntry[] {
  if (card.t !== 'hook' && card.t !== 'fact') return [];
  if (!card.src?.length || !entries?.length) return [];
  const byRef = new Map(entries.map((e) => [String(e.ref), e]));
  const out: SourceEntry[] = [];
  for (const ref of card.src) {
    const entry = byRef.get(ref);
    if (entry && !out.includes(entry)) out.push(entry);
  }
  return out;
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Who published it: the publisher, else the link's host, else the title. */
export function sourcePublisher(entry: SourceEntry): string {
  return entry.publisher || (entry.url ? host(entry.url) : '') || entry.title;
}
