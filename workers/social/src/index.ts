/**
 * T4A Social Worker
 *
 * One cron (`* * * * *`):
 *   - every minute → maybePost(): coin-flip → pick → post to Bluesky
 *   - on minutes where scheduled-minute % 15 === 0, ingestTrends() runs first
 *     (RSS + GDELT snapshot). Consolidated from a separate every-15-min
 *     cron to stay within Cloudflare's 5-cron-per-account free-plan limit.
 *
 * HTTP endpoints (gated by ADMIN_SECRET):
 *   - GET  /health           → public; ops snapshot
 *   - POST /admin/post-now   → forces one post regardless of schedule (testing)
 *   - POST /admin/ingest     → forces trend ingest
 *
 * Card index is uploaded to KV out-of-band (after deploy) with:
 *   wrangler kv:key put cards:index --binding T4A_SOCIAL_KV @public/social-card-index.json
 */
import type { Env, SocialCard } from './types';
import {
  appendPostLog,
  getCardIndex,
  getLastPostAt,
  getPostLog,
  getRadar,
  getRecentPostedIssueIds,
  getRecentPostedKeys,
  getTrends,
  markCardPosted,
  setLastPostAt,
} from './kv';
import { ingestTrends } from './trends';
import { pickBestCard } from './scorer';
import { shouldPostNow } from './scheduler';
import { postCardToBluesky, type PostResult } from './bluesky';

async function maybePost(env: Env, force = false): Promise<{ posted: boolean; reason: string; card?: SocialCard }> {
  if (!force) {
    const decision = await shouldPostNow(env);
    if (!decision.shouldPost) return { posted: false, reason: decision.reason };
  }

  const index = await getCardIndex(env);
  if (!index || !Array.isArray(index.cards) || index.cards.length === 0) {
    return { posted: false, reason: 'no-card-index (upload public/social-card-index.json to KV)' };
  }

  const snapshot = await getTrends(env);
  if (!snapshot) {
    return { posted: false, reason: 'no-trend-snapshot (waiting for first ingest cycle)' };
  }

  // Radar boost is optional — if not cached, scorer falls back to trends-only
  // scoring (radar arg becomes null, radarBoost returns 0).
  const radar = await getRadar(env);

  const [postedKeys, postedIssueIds] = await Promise.all([
    getRecentPostedKeys(env, index.cards),
    getRecentPostedIssueIds(env, index.cards),
  ]);
  const pick = await pickBestCard(env, index.cards, postedKeys, postedIssueIds, snapshot, radar);

  if (!pick.card) {
    return { posted: false, reason: `${pick.reason} (considered=${pick.considered})` };
  }

  let result: PostResult;
  try {
    result = await postCardToBluesky(env, pick.card);
  } catch (err) {
    console.error('Bluesky post failed:', err);
    return { posted: false, reason: `post-error: ${(err as Error).message}` };
  }

  await markCardPosted(env, pick.card);
  await setLastPostAt(env, Date.now());
  await appendPostLog(env, {
    issueId: pick.card.issueId,
    cardIndex: pick.card.cardIndex,
    postedAt: new Date().toISOString(),
    uri: result.uri,
    cid: result.cid,
  });

  return { posted: true, reason: `score=${pick.topScoreB ?? '?'} issue=${pick.card.issueId} card=${pick.card.cardIndex}`, card: pick.card };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function unauthorized(): Response {
  return json({ error: 'unauthorized' }, 401);
}

function checkAdmin(request: Request, env: Env): boolean {
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const headerSecret = request.headers.get('x-admin-secret');
  return env.ADMIN_SECRET !== '' && (querySecret === env.ADMIN_SECRET || headerSecret === env.ADMIN_SECRET);
}

export default {
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    const minute = new Date(controller.scheduledTime).getUTCMinutes();
    if (minute % 15 === 0) {
      try {
        const snap = await ingestTrends(env);
        console.log(`trends ingested: ${snap.headlines.length} headlines, ${Object.keys(snap.entities).length} entities`);
      } catch (err) {
        console.error('ingestTrends failed:', err);
      }
      // Radar is uploaded to KV directly by CI (radar:current) — no worker
      // fetch needed. Scorer reads it via getRadar() at post-decision time.
    }
    const r = await maybePost(env);
    if (r.posted) console.log(`posted: ${r.reason}`);
    // Suppress noisy non-post messages — only log when we attempt and fail.
    else if (!r.reason.startsWith('outside-window') && !r.reason.startsWith('cooldown') && !r.reason.startsWith('roll')) {
      console.log(`skip: ${r.reason}`);
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      // Gated: an unauthenticated probe gets 404 (not 401) so the endpoint
      // is indistinguishable from a non-existent route and doesn't advertise
      // that the bot exists. The ops-monitoring curl needs to pass
      // x-admin-secret to get the full snapshot.
      if (!checkAdmin(request, env)) {
        return new Response('not found', { status: 404 });
      }
      const [snapshot, lastPostAt, log] = await Promise.all([
        getTrends(env),
        getLastPostAt(env),
        getPostLog(env),
      ]);
      const now = Date.now();
      const count24h = log.filter((e) => Date.parse(e.postedAt) > now - 86_400_000).length;
      const count30d = log.length;
      return json({
        ok: true,
        lastPostedAt: lastPostAt ? new Date(lastPostAt).toISOString() : null,
        lastTrendUpdate: snapshot?.updatedAt ?? null,
        trendHeadlines: snapshot?.headlines.length ?? 0,
        postCount24h: count24h,
        postCount30d: count30d,
      });
    }

    if (url.pathname === '/admin/post-now' && request.method === 'POST') {
      if (!checkAdmin(request, env)) return unauthorized();
      const r = await maybePost(env, true);
      return json(r);
    }

    if (url.pathname === '/admin/ingest' && request.method === 'POST') {
      if (!checkAdmin(request, env)) return unauthorized();
      try {
        const snap = await ingestTrends(env);
        return json({ ok: true, headlines: snap.headlines.length, entities: Object.keys(snap.entities).length });
      } catch (err) {
        return json({ ok: false, error: (err as Error).message }, 500);
      }
    }

    if (url.pathname === '/admin/log' && request.method === 'GET') {
      if (!checkAdmin(request, env)) return unauthorized();
      const log = await getPostLog(env);
      return json({ log });
    }

    return new Response('tfa-social', { status: 200 });
  },
};
