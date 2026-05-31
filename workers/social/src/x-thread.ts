/**
 * X (manual) thread builder.
 *
 * T4A does NOT auto-post to X (the X API is metered/paid on console.x.com).
 * Instead, this turns a published issue into a ready-to-paste X thread so the
 * operator posts it by hand in ~10 seconds. Exposed via the gated
 * /admin/x-draft endpoint — never public.
 *
 * Design choices:
 *  - Lead post is pure hook text, NO link. X tends to suppress reach on posts
 *    whose first tweet carries an outbound link, so the link goes in the LAST
 *    post instead. The hook is the scroll-stopper; let it breathe.
 *  - The OG image is attached manually to post 1 (path returned for convenience).
 *  - Each post is kept within the 280-char limit; `sub` is appended only when
 *    big+sub still fits with margin.
 *  - Card order follows the issue's natural arc: hook → facts → reframe →
 *    (analogy) → view, which is already the considered-reading sequence.
 */
import type { SocialCard } from './types';

const TWEET_LIMIT = 280;
const SAFETY = 10; // keep margin below the hard limit

export interface XThreadPost {
  n: number;
  cardType: string;
  text: string;
  note?: string;
}

export interface XThread {
  issueId: string;
  imageToAttach: string; // attach to post 1
  posts: XThreadPost[];
  plainText: string; // ready-to-copy, posts separated by a divider
}

function compose(big: string, sub: string | undefined): string {
  if (!sub) return big;
  const combined = `${big} ${sub}`;
  return combined.length <= TWEET_LIMIT - SAFETY ? combined : big;
}

export function buildXThread(allCards: SocialCard[], issueId: string, siteUrl: string): XThread | null {
  const cards = allCards
    .filter((c) => c.issueId === issueId)
    .sort((a, b) => a.cardIndex - b.cardIndex);
  if (cards.length === 0) return null;

  const link = `${siteUrl}/issue/${issueId}`;
  const hook = cards.find((c) => c.cardType === 'hook');
  const view = cards.find((c) => c.cardType === 'view');
  const middle = cards.filter((c) => c.cardType !== 'hook' && c.cardType !== 'view');

  const posts: XThreadPost[] = [];
  let n = 1;

  // Post 1 — hook, no link, image attached.
  if (hook) {
    posts.push({
      n: n++,
      cardType: 'hook',
      text: compose(hook.big, hook.sub),
      note: 'Attach the issue image here. No link in this post (protects reach).',
    });
  }

  // Middle — facts, reframe, analogy in issue order.
  for (const c of middle) {
    posts.push({ n: n++, cardType: c.cardType, text: compose(c.big, c.sub) });
  }

  // Final — view + link + soft CTA. The only post carrying the link.
  if (view) {
    const tail = `${view.big}\n\nFull issue: ${link}`;
    posts.push({
      n: n++,
      cardType: 'view',
      text: tail.length <= TWEET_LIMIT ? tail : `${view.big}\n${link}`,
      note: 'Only post with the link, so X does not suppress the thread.',
    });
  } else {
    posts.push({ n: n++, cardType: 'link', text: `Full issue: ${link}`, note: 'Link tail.' });
  }

  const plainText = posts
    .map((p) => `[${p.n}/${posts.length}] (${p.cardType})${p.note ? `  «${p.note}»` : ''}\n${p.text}`)
    .join('\n\n────────\n\n');

  return {
    issueId,
    imageToAttach: hook ? hook.imagePath : (cards[0]?.imagePath ?? ''),
    posts,
    plainText,
  };
}

/**
 * Posting-time advice in Malaysia time (UTC+8), independent of any API.
 * Returns the recommended next window given the current moment.
 */
export function postingWindowAdviceMYT(now: Date): { mytHour: number; window: string; advice: string } {
  const mytHour = (now.getUTCHours() + 8) % 24;
  let window: string;
  let advice: string;
  if (mytHour >= 7 && mytHour < 10) {
    window = 'morning (07:00-10:00 MYT)';
    advice = 'Prime window — commute scroll. Best for a freshly published issue, especially on a notification morning (Tue/Thu/Sat).';
  } else if (mytHour >= 12 && mytHour < 14) {
    window = 'lunch (12:30-14:00 MYT)';
    advice = 'Good secondary window — lunch scroll. Solid for a single punchy post or quote.';
  } else if (mytHour >= 20 && mytHour < 23) {
    window = 'evening (20:30-22:30 MYT)';
    advice = 'Strongest window for considered/political threads — people actually read at night.';
  } else {
    window = 'off-peak';
    advice = 'Outside the prime windows. Hold for 07:00-10:00, 12:30-14:00, or 20:30-22:30 MYT unless the topic is live in the news right now (reactive posting beats any fixed slot).';
  }
  return { mytHour, window, advice };
}
