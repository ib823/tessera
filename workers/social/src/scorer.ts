/**
 * Two-stage card-trend matching:
 *   Stage A — lexical pre-filter (zero cost) → top 8 candidates
 *   Stage B — LLM rerank via Workers AI Llama 3.1 8B
 *
 * Stage A weights overlap against two signals:
 *   - external trends (RSS + GDELT, refreshed every 15 min)
 *   - T4A radar's high-priority controversy queue (refreshed every 2h
 *     on GitHub Actions, slim-extracted to public/radar-summary.json)
 *
 * Returns the highest-scoring unposted card, or null if no card clears the
 * relevance floor (in which case the scheduler skips this slot).
 */
import type { Env, RadarSummary, SocialCard, TrendSnapshot } from './types';
import { isPostableCard } from './cards';

const RELEVANCE_FLOOR = 4; // 0-10; cards scoring below skip the slot
const SHORTLIST_SIZE = 8;
const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// Radar boost knobs. radarBoost is summed across matching entities and
// keywords (keyword matches at half weight), then capped, then multiplied
// by COEF. With COEF=1.5 and CAP=3.0, max radar contribution is +4.5 —
// comparable to a strong trend-entity hit (+6 max).
const RADAR_COEF = 1.5;
const RADAR_CAP_PER_CARD = 3.0;
const RADAR_KEYWORD_WEIGHT = 0.5;

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

function radarBoost(card: SocialCard, radar: RadarSummary | null): number {
  if (!radar) return 0;
  let raw = 0;
  for (const e of card.entities) {
    raw += radar.entities[e] ?? 0;
  }
  for (const k of card.topicKeywords) {
    raw += (radar.keywords[k] ?? 0) * RADAR_KEYWORD_WEIGHT;
  }
  return Math.min(raw, RADAR_CAP_PER_CARD) * RADAR_COEF;
}

function lexicalScore(
  card: SocialCard,
  snapshot: TrendSnapshot,
  radar: RadarSummary | null,
  now: number,
): number {
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

  // Radar boost — high-priority controversy queue from radar/ pipeline
  s += radarBoost(card, radar);

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
  postedIssueIds: Set<string>,
  snapshot: TrendSnapshot,
  radar: RadarSummary | null,
): Promise<PickResult> {
  const now = Date.now();
  const candidates: Scored[] = [];

  for (const c of cards) {
    if (!isPostableCard(c)) continue;
    if (postedKeys.has(`${c.issueId}:${c.cardIndex}`)) continue;
    // Issue-level cooldown: skip every card from an issue that already had
    // a post in the last ISSUE_COOLDOWN_HOURS. Prevents same-issue clustering
    // when one issue's topic dominates today's trend + radar signals.
    if (postedIssueIds.has(c.issueId)) continue;
    candidates.push({ card: c, scoreA: lexicalScore(c, snapshot, radar, now) });
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
