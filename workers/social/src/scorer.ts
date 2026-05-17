/**
 * Two-stage card-trend matching:
 *   Stage A — lexical pre-filter (zero cost) → top 8 candidates
 *   Stage B — LLM rerank via Workers AI Llama 3.1 8B
 *
 * Returns the highest-scoring unposted card, or null if no card clears the
 * relevance floor (in which case the scheduler skips this slot).
 */
import type { Env, SocialCard, TrendSnapshot } from './types';
import { isPostableCard } from './cards';

const RELEVANCE_FLOOR = 4; // 0-10; cards scoring below skip the slot
const SHORTLIST_SIZE = 8;
const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct';

interface Scored {
  card: SocialCard;
  scoreA: number;
  scoreB?: number;
}

function daysBetween(iso: string | null, now: number): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, (now - t) / 86_400_000);
}

function lexicalScore(card: SocialCard, snapshot: TrendSnapshot, now: number): number {
  let s = card.weight;

  // Entity overlap (weight 2.0 each)
  for (const e of card.entities) {
    const trendCount = snapshot.entities[e];
    if (trendCount) s += 2.0 * Math.min(3, trendCount);
  }

  // Keyword overlap (weight 1.0 each, capped at 5 keywords)
  let kwHits = 0;
  for (const k of card.topicKeywords) {
    if (snapshot.keywords[k]) {
      s += 1.0;
      if (++kwHits >= 5) break;
    }
  }

  // Age decay: -0.05 per day since the issue's source date
  s -= 0.05 * daysBetween(card.sourceDate, now);

  return s;
}

function buildAiPrompt(card: SocialCard, snapshot: TrendSnapshot): string {
  const topHeadlines = snapshot.headlines
    .slice(0, 5)
    .map((h, i) => `${i + 1}. ${h.title}`)
    .join('\n');

  return `You are scoring whether an editorial analysis card is timely to post given today's Malaysian news.

Today's top Malaysian headlines:
${topHeadlines}

Card text:
"${card.big}${card.sub ? ' — ' + card.sub : ''}"

Rate the card's relevance to TODAY's news on a 0-10 integer scale:
- 10 = directly addresses a top headline today
- 7-9 = same institution, law, or theme as today's news
- 4-6 = adjacent topic, partially relevant
- 0-3 = unrelated to today's news

Reply ONLY with a single integer 0-10. No explanation.`;
}

async function aiScore(env: Env, card: SocialCard, snapshot: TrendSnapshot): Promise<number> {
  const prompt = buildAiPrompt(card, snapshot);
  try {
    const out = await env.AI.run(AI_MODEL, {
      prompt,
      max_tokens: 4,
      temperature: 0.1,
    } as unknown as Parameters<typeof env.AI.run>[1]);
    const raw = typeof out === 'object' && out && 'response' in out
      ? String((out as { response?: unknown }).response ?? '')
      : String(out ?? '');
    const m = raw.match(/\d+/);
    if (!m) return 0;
    const n = Math.min(10, Math.max(0, parseInt(m[0], 10)));
    return n;
  } catch (err) {
    console.warn('AI score failed:', err);
    return 0;
  }
}

export interface PickResult {
  card: SocialCard | null;
  reason: 'picked' | 'no-candidates' | 'below-floor';
  considered: number;
  topScoreB?: number;
}

export async function pickBestCard(
  env: Env,
  cards: SocialCard[],
  postedKeys: Set<string>,
  snapshot: TrendSnapshot,
): Promise<PickResult> {
  const now = Date.now();
  const candidates: Scored[] = [];

  for (const c of cards) {
    if (!isPostableCard(c)) continue;
    if (postedKeys.has(`${c.issueId}:${c.cardIndex}`)) continue;
    candidates.push({ card: c, scoreA: lexicalScore(c, snapshot, now) });
  }

  if (candidates.length === 0) {
    return { card: null, reason: 'no-candidates', considered: 0 };
  }

  candidates.sort((a, b) => b.scoreA - a.scoreA);
  const shortlist = candidates.slice(0, SHORTLIST_SIZE);

  // Stage B — AI rerank
  await Promise.all(
    shortlist.map(async (s) => {
      s.scoreB = await aiScore(env, s.card, snapshot);
    }),
  );

  shortlist.sort((a, b) => {
    const db = (b.scoreB ?? 0) - (a.scoreB ?? 0);
    if (db !== 0) return db;
    return b.scoreA - a.scoreA;
  });

  const top = shortlist[0];
  if ((top.scoreB ?? 0) < RELEVANCE_FLOOR) {
    return { card: null, reason: 'below-floor', considered: candidates.length, topScoreB: top.scoreB };
  }

  return { card: top.card, reason: 'picked', considered: candidates.length, topScoreB: top.scoreB };
}
