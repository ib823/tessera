/**
 * Typed KV accessors. Keys:
 *   cards:index          → CardIndex (set out-of-band via wrangler kv:key put)
 *   trends:current       → TrendSnapshot (TTL 60min)
 *   radar:current        → RadarSummary (TTL 4h; refreshed every 15min tick)
 *   posted:{id}:{n}      → ISO timestamp (TTL 30 days) — per-card cooldown
 *   issue-posted:{id}    → ISO timestamp (TTL ISSUE_COOLDOWN_HOURS) — per-issue
 *                          cooldown to prevent back-to-back posts from the
 *                          same issue when its topic dominates today's signals
 *   posts:log            → PostLogEntry[] (ring buffer, last 50)
 *   auth:session         → BlueskySession (TTL 110min)
 *   last-post-at         → epoch ms (used by scheduler cooldown)
 */
import type { BlueskySession, CardIndex, Env, PostLogEntry, RadarSummary, SocialCard, TrendSnapshot } from './types';

const KEY = {
  cardsIndex: 'cards:index',
  trendsCurrent: 'trends:current',
  radarCurrent: 'radar:current',
  postsLog: 'posts:log',
  authSession: 'auth:session',
  lastPostAt: 'last-post-at',
  postedCard: (id: string, n: number) => `posted:${id}:${n}`,
  postedIssue: (id: string) => `issue-posted:${id}`,
};

export async function getCardIndex(env: Env): Promise<CardIndex | null> {
  return env.T4A_SOCIAL_KV.get<CardIndex>(KEY.cardsIndex, 'json');
}

export async function getTrends(env: Env): Promise<TrendSnapshot | null> {
  return env.T4A_SOCIAL_KV.get<TrendSnapshot>(KEY.trendsCurrent, 'json');
}

export async function putTrends(env: Env, snapshot: TrendSnapshot): Promise<void> {
  const ttlSec = Number(env.TREND_CACHE_TTL_MIN || '60') * 60;
  await env.T4A_SOCIAL_KV.put(KEY.trendsCurrent, JSON.stringify(snapshot), {
    expirationTtl: ttlSec,
  });
}

export async function getRadar(env: Env): Promise<RadarSummary | null> {
  return env.T4A_SOCIAL_KV.get<RadarSummary>(KEY.radarCurrent, 'json');
}

export async function putRadar(env: Env, summary: RadarSummary): Promise<void> {
  // Radar refreshes every 2h on GitHub Actions; cache 4h so a missed refresh
  // doesn't immediately remove the boost. Each 15-min tick re-ingests, so a
  // healthy schedule keeps this well within TTL.
  await env.T4A_SOCIAL_KV.put(KEY.radarCurrent, JSON.stringify(summary), {
    expirationTtl: 4 * 60 * 60,
  });
}

export async function isCardPosted(env: Env, card: SocialCard): Promise<boolean> {
  const v = await env.T4A_SOCIAL_KV.get(KEY.postedCard(card.issueId, card.cardIndex));
  return v !== null;
}

export async function markCardPosted(env: Env, card: SocialCard): Promise<void> {
  const cardTtlSec = Number(env.POSTED_CARD_TTL_DAYS || '30') * 86400;
  const issueTtlSec = Number(env.ISSUE_COOLDOWN_HOURS || '12') * 3600;
  const nowIso = new Date().toISOString();
  // Per-card + per-issue cooldown written together. Both keys auto-expire.
  await Promise.all([
    env.T4A_SOCIAL_KV.put(KEY.postedCard(card.issueId, card.cardIndex), nowIso, {
      expirationTtl: cardTtlSec,
    }),
    env.T4A_SOCIAL_KV.put(KEY.postedIssue(card.issueId), nowIso, {
      expirationTtl: issueTtlSec,
    }),
  ]);
}

export async function getRecentPostedKeys(env: Env, cards: SocialCard[]): Promise<Set<string>> {
  // Batch-check posted status. KV has no multi-get; do parallel reads with a cap.
  const out = new Set<string>();
  const CONCURRENCY = 20;
  for (let i = 0; i < cards.length; i += CONCURRENCY) {
    const batch = cards.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((c) => env.T4A_SOCIAL_KV.get(KEY.postedCard(c.issueId, c.cardIndex))),
    );
    for (let j = 0; j < batch.length; j++) {
      if (results[j] !== null) out.add(`${batch[j].issueId}:${batch[j].cardIndex}`);
    }
  }
  return out;
}

export async function getRecentPostedIssueIds(env: Env, cards: SocialCard[]): Promise<Set<string>> {
  // Batch-check issue cooldown. Deduplicate issueIds first since many cards
  // share the same issue.
  const issueIds = [...new Set(cards.map((c) => c.issueId))];
  const out = new Set<string>();
  const CONCURRENCY = 20;
  for (let i = 0; i < issueIds.length; i += CONCURRENCY) {
    const batch = issueIds.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((id) => env.T4A_SOCIAL_KV.get(KEY.postedIssue(id))),
    );
    for (let j = 0; j < batch.length; j++) {
      if (results[j] !== null) out.add(batch[j]);
    }
  }
  return out;
}

export async function getSession(env: Env): Promise<BlueskySession | null> {
  return env.T4A_SOCIAL_KV.get<BlueskySession>(KEY.authSession, 'json');
}

export async function putSession(env: Env, session: BlueskySession): Promise<void> {
  // Cache for 110 min — sessions expire in 120 min, refresh early.
  await env.T4A_SOCIAL_KV.put(KEY.authSession, JSON.stringify(session), {
    expirationTtl: 110 * 60,
  });
}

export async function clearSession(env: Env): Promise<void> {
  await env.T4A_SOCIAL_KV.delete(KEY.authSession);
}

export async function getLastPostAt(env: Env): Promise<number | null> {
  const v = await env.T4A_SOCIAL_KV.get(KEY.lastPostAt);
  return v ? Number(v) : null;
}

export async function setLastPostAt(env: Env, ts: number): Promise<void> {
  await env.T4A_SOCIAL_KV.put(KEY.lastPostAt, String(ts));
}

export async function appendPostLog(env: Env, entry: PostLogEntry): Promise<void> {
  const raw = await env.T4A_SOCIAL_KV.get<PostLogEntry[]>(KEY.postsLog, 'json');
  const log = Array.isArray(raw) ? raw : [];
  log.unshift(entry);
  while (log.length > 50) log.pop();
  await env.T4A_SOCIAL_KV.put(KEY.postsLog, JSON.stringify(log));
}

export async function getPostLog(env: Env): Promise<PostLogEntry[]> {
  const raw = await env.T4A_SOCIAL_KV.get<PostLogEntry[]>(KEY.postsLog, 'json');
  return Array.isArray(raw) ? raw : [];
}
