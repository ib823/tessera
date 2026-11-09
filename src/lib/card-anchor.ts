/**
 * Card deep links: /issue/{id}#card-N, with N counted from 1 as readers see
 * it ("card 3 of 7"). The static article gives each card section the same
 * id, so the anchor also works with JavaScript off; the readers read it on
 * open and start at that card.
 */

const CARD_HASH = /^#card-(\d{1,2})$/;

/** The anchor for a card, from its 0-based index. */
export function cardAnchor(index: number): string {
  return `card-${index + 1}`;
}

/**
 * The 0-based card index a hash points to, or null when the hash is not a
 * card anchor or names a card the issue does not have.
 */
export function cardIndexFromHash(hash: string, cardCount: number): number | null {
  const match = CARD_HASH.exec(hash.trim());
  if (!match) return null;
  const index = Number(match[1]) - 1;
  return index >= 0 && index < cardCount ? index : null;
}

/**
 * The card a reader should open at: the URL's #card-N when the page is this
 * issue's own URL, otherwise null. Browser-only; returns null on the server.
 */
export function initialCardFromLocation(issueId: string, cardCount: number): number | null {
  if (typeof window === 'undefined') return null;
  const { pathname, hash } = window.location;
  if (pathname.replace(/\/$/, '') !== `/issue/${issueId}`) return null;
  return cardIndexFromHash(hash, cardCount);
}

/** Absolute share URL for an issue, or for one of its cards when `cardIndex` is given. */
export function issueShareUrl(origin: string, issueId: string, cardIndex: number | null, version?: string): string {
  const query = version ? `?v=${encodeURIComponent(version)}` : '';
  const hash = cardIndex === null ? '' : `#${cardAnchor(cardIndex)}`;
  return `${origin}/issue/${issueId}${query}${hash}`;
}
