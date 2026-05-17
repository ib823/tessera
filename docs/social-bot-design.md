# T4A Social Bot — Design

Auto-poster for T4A cards. Bluesky-first ($0/mo). X is a feature-flagged Phase 2 add-on (~$16.50/mo when enabled, see `social-bot-research.md` if added later).

---

## 1. Goals & non-goals

**Goals**
- Post 5–10 cards/day to `@4thangle.bsky.social`, picked from the published-issue archive.
- Picks must reflect *current* Malaysian news at posting time — not a card from a 2-week-old issue when nothing in the news today relates to it.
- No card repeats inside a 30-day rolling window.
- Posting cadence and timing look human (irregular gaps, daytime MYT bias, no rigid schedule).
- $0/month operational cost on Cloudflare free tier.
- Zero ongoing manual operator effort once deployed.

**Non-goals**
- Replying to mentions / DMs / engagement.
- Personalised feeds or A/B testing.
- Posting drafts or unpublished issues.
- Cross-platform federation beyond Bluesky in v1 (Mastodon mirror is easy to add later).

---

## 2. Architecture at a glance

```
┌──────────────────────────────────────────────────────────────────────┐
│ Cloudflare Pages (existing)                                          │
│   build:  npm run build                                              │
│     ├─ generate-og-images.mjs   (existing)                           │
│     └─ build-social-cards.mjs   (NEW)                                │
│        ├─ public/og/social/issue-{id}-card{n}-1200x675.png           │
│        └─ public/social-card-index.json                              │
└──────────────────────────────────────────────────────────────────────┘
                              ▲ fetch on cold start
                              │
┌──────────────────────────────────────────────────────────────────────┐
│ Cloudflare Worker: tfa-social  (workers/social/)                     │
│                                                                      │
│  cron "*/15 * * * *"  ──► ingestTrends()                             │
│    • fetch GDELT MY  ──► merge headlines + entities                  │
│    • fetch 5 Malaysian RSS feeds (Malaysiakini, FMT, Star, Bernama,  │
│      MalayMail)  ──► merge headlines + entities                      │
│    • write KV  trends:current  (TTL 60min)                           │
│                                                                      │
│  cron "* * * * *"  ──► maybePost()                                   │
│    • per-minute coin flip gated by MYT clock & last-post cooldown    │
│    • on hit:                                                         │
│        1. load card index + trends:current + posted:* keys           │
│        2. shortlist unposted cards by lexical overlap with trends    │
│        3. rank top 8 via Workers AI (Llama 3.1 8B)                   │
│        4. pick top card                                              │
│        5. fetch pre-baked image from Pages                           │
│        6. POST to Bluesky (createSession → uploadBlob →              │
│           createRecord)                                              │
│        7. KV write  posted:{id}:{n}  TTL 30d                         │
│        8. append KV  posts:log  (last 50)                            │
└──────────────────────────────────────────────────────────────────────┘
                              │ posts
                              ▼
                       Bluesky AT Proto
```

Two cron triggers, one image-baking script, one KV namespace. Nothing else.

---

## 3. Repo layout

```
docs/
  social-bot-design.md          ← this file
  social-bot-research.md        ← (TODO: ports the research from the chat)
scripts/
  build-social-cards.mjs        ← NEW: bakes per-card images + index at build time
workers/
  notify/                       ← existing, untouched
  sync/                         ← existing, untouched
  social/                       ← NEW
    wrangler.toml
    src/
      index.ts                  ← Worker entry: scheduled() router
      bluesky.ts                ← AT Protocol client
      trends.ts                 ← RSS + GDELT ingest
      scorer.ts                 ← lexical + Workers AI relevance scoring
      scheduler.ts              ← per-minute coin flip + MYT clock
      kv.ts                     ← typed KV accessors
      cards.ts                  ← card index types + filters
      types.ts
public/
  social-card-index.json        ← NEW (generated)
  og/social/                    ← NEW (generated)
    issue-{id}-card{n}-1200x675.png
```

Naming follows existing conventions (`tfa-notify` → `tfa-social`, sibling `wrangler.toml`).

---

## 4. The card universe

Every published issue in `src/data/issues/{id}.json` yields several social-postable cards. Not all card types are equal as standalone posts:

| Card type | Postable? | Priority weight |
|---|---|---|
| `hook`    | Yes — designed for attention | 1.0 |
| `view`    | Yes — designed as quotable | 0.9 |
| `reframe` | Yes — short, punchy | 0.7 |
| `fact` ×3 | Yes — has supporting number | 0.6 |
| `analogy` | Yes — accessible if present | 0.5 |

Roughly 60 published issues × ~6 postable cards each = **~360 distinct cards in rotation**. At 7 posts/day, with a 30-day no-repeat window, that's **210 posts in the cooldown window**. Comfortable headroom — we'll never run dry.

Card record (output of `build-social-cards.mjs`):

```ts
type SocialCard = {
  issueId: string;          // "0142"
  cardIndex: number;        // 0..6
  cardType: 'hook'|'fact'|'reframe'|'analogy'|'view';
  big: string;              // ≤180 chars
  sub: string;              // ≤220 chars, may be ""
  lens: string | null;      // "Economic" etc, fact cards only
  entities: string[];       // pre-extracted from headline+context+big+sub
  topicKeywords: string[];  // top-10 TF-IDF terms vs whole corpus
  sourceDate: string;       // ISO from issue
  imagePath: string;        // "/og/social/issue-0142-card2-1200x675.png"
  weight: number;           // from table above
};
```

Entities and `topicKeywords` are pre-computed at build time so the Worker does zero NLP per post (just lexical-overlap scoring against trend tokens, then Workers AI on the shortlist).

---

## 5. Trend ingestion

`workers/social/src/trends.ts`, invoked by the `*/15 * * * *` cron.

**Sources, in priority order:**

| Source | URL | Why |
|---|---|---|
| GDELT 2.0 DOC | `api.gdeltproject.org/api/v2/doc/doc?query=sourcecountry:MY&mode=ArtList&format=json&maxrecords=75&timespan=24h` | Most reliable, no key, country-filtered |
| Malaysiakini RSS | `https://www.malaysiakini.com/rss/en/news.rss` | Hub of MY political news |
| FMT RSS | `https://www.freemalaysiatoday.com/feed/` | Full-text, opposition-leaning |
| Star RSS | `https://www.thestar.com.my/rss/news/nation` | Mainstream-aligned |
| Bernama RSS | `https://www.bernama.com/en/rssfeed.php` | Official news agency |
| MalayMail RSS | `https://www.malaymail.com/rss` | Independent |

**Per-cycle flow:**
1. `Promise.allSettled` all 6 fetches with a 5-second timeout each. One source failing never blocks the cycle.
2. For each headline in the last 24h, extract entities using a static regex pack (institutions, politicians, laws — same patterns as `scripts/build-fact-graph.mjs`) and lowercase keyword tokens (stopwords-filtered).
3. Merge into `TrendSnapshot`:
   ```ts
   type TrendSnapshot = {
     updatedAt: string;        // ISO
     headlines: Array<{ source: string; title: string; url: string; publishedAt: string }>;
     entities: Map<string, number>;   // entity → mention count across sources
     keywords: Map<string, number>;   // keyword → idf-weighted score
   };
   ```
4. Write to KV: `trends:current` with 60-min TTL.

**Why every 15 minutes:** the news cycle moves at ~hourly resolution in Malaysia; 15-min poll catches breaking stories within one cycle of posting decisions. 96 polls/day × 6 fetches = 576 outbound requests, well within Worker free-tier limits.

**Cloudflare WAF risk:** some news sites block bot user-agents. Mitigation: set `User-Agent: TheFourthAngle-Trends/1.0 (+https://thefourthangle.pages.dev/contact)`. If a source returns 403, log it and skip — GDELT alone is enough for the bot to function.

---

## 6. Card-trend matching

`workers/social/src/scorer.ts`. Two-stage to fit inside the Workers AI 10k-neurons/day free tier.

**Stage A — lexical pre-filter (zero cost):**
For each unposted card, compute:
```
score_A = card.weight
        + 2.0 × |entities ∩ trend.entities|
        + 1.0 × Σ keyword_match_score
        - 0.05 × age_days(card.sourceDate)
```
Take top 8 candidates. This handles 90% of the signal for free.

**Stage B — LLM rerank (Workers AI Llama 3.1 8B, ~50–100 neurons per call):**
For the top 8 candidates, prompt:
```
Today's Malaysian news:
{top 5 trending headlines}

Card text:
"{card.big} — {card.sub}"

Rate this card's relevance to today's news (0-10).
Reply ONLY with a single integer 0-10.
```
Pick the highest-scoring card. Tie-break by `card.weight`, then by oldest-not-recently-posted.

Daily neuron budget: 7 posts × 8 candidates × ~80 neurons ≈ **4,500 neurons/day**, 45% of the free tier.

**Floor:** if no card scores ≥4 in Stage B, **skip this posting slot entirely**. Better to post 4 cards on a quiet news day than to post something off-topic and break the bot's credibility.

---

## 7. Scheduling — human-like cadence

`workers/social/src/scheduler.ts`, invoked every minute by the `* * * * *` cron.

```
MYT now → if outside 08:00–22:00 MYT: return without posting
       → if last-post timestamp within 75 minutes: return without posting
       → p = base_rate × time_of_day_weight(MYT_hour)
       → if Math.random() < p: try to post
```

**Tuning:**
- `base_rate` = `target_daily_posts / minutes_in_window = 7 / 840 ≈ 0.00833`
- `time_of_day_weight(hour)`:
  - 08–09 (morning commute): 1.3
  - 09–11: 1.0
  - 11–14 (lunch surge): 1.2
  - 14–17: 0.8
  - 17–19 (evening commute): 1.3
  - 19–22: 1.0
- 75-min cooldown enforces ≥75 min between posts (no bursts; max ~11 posts/day in theory)
- Daily target: 7, observed range 5–10 due to randomness

**Why per-minute coin flip instead of cron schedule:**
- Truly irregular (no "this account posts at :07 every hour" pattern)
- Free-tier cron has ±30s jitter — adds natural human-like noise
- Easy to tune `base_rate` by region or day of week later

**Day-of-week balance:**
- T4A's existing push schedule is Tue/Thu/Sat (issue drops). We *don't* boost those days here — that would feel coordinated. Keep uniform across the week so the bot looks independent of the publishing schedule.

---

## 8. Bluesky posting

`workers/social/src/bluesky.ts`. Uses raw `fetch` against AT Proto — no SDK (`@atproto/api` pulls Node deps).

**Auth flow (cached):**
1. Cold-start: read `auth:session` from KV.
2. If present and not expired, use the `accessJwt`.
3. If absent or expired:
   - `POST https://bsky.social/xrpc/com.atproto.server.createSession`
     - body: `{ identifier: "4thangle.bsky.social", password: BLUESKY_APP_PASSWORD }`
   - Cache result in `auth:session` (TTL 110 min — sessions last 2h, we refresh early).

**Post flow:**
1. `GET /image-path → ArrayBuffer` (fetch the pre-baked PNG from Pages).
2. `POST /xrpc/com.atproto.repo.uploadBlob` with `Content-Type: image/png`, body = ArrayBuffer.
   - Returns `{ blob: BlobRef }`.
3. `POST /xrpc/com.atproto.repo.createRecord` with body:
   ```json
   {
     "repo": "did:plc:...",
     "collection": "app.bsky.feed.post",
     "record": {
       "$type": "app.bsky.feed.post",
       "text": "{card.big}\n\n— from issue #{id}, full analysis: thefourthangle.pages.dev/issue/{id}",
       "createdAt": "2026-05-16T11:42:13.123Z",
       "langs": ["en"],
       "embed": {
         "$type": "app.bsky.embed.images",
         "images": [{
           "image": { "$type": "blob", "ref": ..., "mimeType": "image/png", "size": ... },
           "alt": "{card.big} — {card.sub}"
         }]
       }
     }
   }
   ```
4. Persist `posted:{id}:{n} = ISO timestamp` with 30-day TTL.
5. Append to ring buffer `posts:log` (keep last 50 entries for ops/debug).

**Text-body strategy:**
- Bluesky has no per-post URL fee, so the URL in body is fine here.
- Text length: Bluesky cap is 300 graphemes. `card.big` (≤180) + suffix ("from issue …") fits easily.
- The image is the primary content; text is the caption.

**Failure handling:**
- Auth failure (401): clear `auth:session`, retry once. If still failing, log and skip — alert on third consecutive failure via worker tail.
- Blob upload 5xx: retry once with backoff. Skip if still failing.
- Network timeout 10s per call. Total post-attempt budget 30s.
- Never mark a card as posted if the final `createRecord` didn't return 200.

---

## 9. KV schema

Single namespace `T4A_SOCIAL_KV`. Free tier: 100k reads/day, 1k writes/day, 1 GB storage. Estimated load: ~250 reads + ~150 writes/day. **0.25% / 15% of quotas.**

| Key | Value | TTL | Written by |
|---|---|---|---|
| `cards:index` | `SocialCard[]` (all postable cards) | none, refreshed by deploy hook | Build script → KV upload step in CI, or fetched from Pages on cold start |
| `trends:current` | `TrendSnapshot` | 60 min | Trend cron |
| `posted:{id}:{n}` | ISO timestamp | 30 days | Post path |
| `posts:log` | JSON array, last 50 entries `{id, n, postedAt, uri}` | none | Post path |
| `auth:session` | `{ accessJwt, refreshJwt, did, handle, expiresAt }` | 110 min | Bluesky auth path |

**Why `cards:index` lives in KV** (vs. fetching `public/social-card-index.json` from Pages each invocation): saves ~360 KB on every wake-up, and the index changes only at deploy time. Populated via a GitHub Actions step after the build: `wrangler kv:key put cards:index --binding T4A_SOCIAL_KV @public/social-card-index.json`.

---

## 10. Build-time image generation

`scripts/build-social-cards.mjs`, run as part of `npm run build` after `generate-og-images.mjs`.

**Per card, produce a 1200×675 PNG:**

```
┌──────────────────────────────────────────────────────────────┐
│ [navy background, same as existing issue OG art]             │
│                                                              │
│                                                              │
│   {card.big}                       (40px white, weight 700)  │
│                                                              │
│   {card.sub}                       (24px white/80% opacity)  │
│                                                              │
│                                                              │
│   T4A   thefourthangle.pages.dev/issue/{id}   ·   {lens}     │
└──────────────────────────────────────────────────────────────┘
```

Use `sharp` (already a dep) + SVG-templated text overlay, then composite with the issue's existing `public/og/backgrounds/issue-{id}-bg.png`. This is consistent with the existing OG pipeline.

Filenames: `public/og/social/issue-{id}-card{n}-1200x675.png` (~60–80 KB each, ~25 MB total for 360 cards).

The index `public/social-card-index.json` is emitted alongside.

**Build-time NLP:** entity extraction uses the same patterns from `scripts/build-fact-graph.mjs` (re-export the entity regex pack from `scripts/lib/`). Keyword extraction uses a small TF-IDF pass across all issues (no external libs needed; ~50 lines).

---

## 11. Configuration & secrets

`workers/social/wrangler.toml`:
```toml
name = "tfa-social"
main = "src/index.ts"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[triggers]
crons = ["*/15 * * * *", "* * * * *"]

[[kv_namespaces]]
binding = "T4A_SOCIAL_KV"
id = "<created via wrangler kv:namespace create>"

[ai]
binding = "AI"

[vars]
SITE_URL = "https://thefourthangle.pages.dev"
BLUESKY_IDENTIFIER = "4thangle.bsky.social"
BLUESKY_PDS = "https://bsky.social"
TARGET_POSTS_PER_DAY = "7"
COOLDOWN_MINUTES = "75"
ENABLE_X = "false"   # Phase 2 flag

# Secrets (set via `wrangler secret put`):
#   BLUESKY_APP_PASSWORD
```

**Secrets to be set once at deploy:**
- `BLUESKY_APP_PASSWORD` = the App Password you already provided.

Nothing else.

---

## 12. Observability & ops

**Logs:** `wrangler tail tfa-social` streams live logs.

**Post log:** read `posts:log` via `wrangler kv:key get posts:log --binding T4A_SOCIAL_KV`.

**Manual trigger for testing:** add an HTTP endpoint `POST /admin/post-now?secret=...` that bypasses the coin flip and forces one post. Gated by a separate secret. Useful for debugging without waiting for the next slot.

**Health endpoint:** `GET /health` returns `{ lastPostedAt, lastTrendUpdate, postCount24h, postCount30d, kvWarnings }`. Public, read-only.

**Failure alerts:** if Bluesky auth fails 3 times in a row, write an `alerts` KV key. The existing `tfa-notify` Worker (which already sends push notifications) could check this and ping the operator — but that's a v1.1 feature. v1.0 just logs.

---

## 13. Deploy & first run

```
# one-time
cd workers/social
wrangler kv:namespace create T4A_SOCIAL_KV
# → copy returned id into wrangler.toml
wrangler secret put BLUESKY_APP_PASSWORD
# → paste the app password

# every deploy (or via GitHub Actions step)
wrangler deploy
wrangler kv:key put cards:index --binding T4A_SOCIAL_KV @../../public/social-card-index.json
```

**First-run smoke test:**
1. `curl -X POST $WORKER_URL/admin/post-now?secret=...` → should produce one Bluesky post.
2. Verify post appears at `https://bsky.app/profile/4thangle.bsky.social`.
3. Watch `wrangler tail` for the next 24h to confirm the scheduler is firing.

---

## 14. Phase 2: adding X (paid)

If/when the operator decides X is worth ~$16.50/mo:
- Implement `workers/social/src/x.ts` mirroring `bluesky.ts`.
- One-time OAuth 2 PKCE dance via a `/oauth/x/callback` route to capture and store the refresh token as a secret.
- In `maybePost()`, after a successful Bluesky post, fan out to `postToX()` if `ENABLE_X === "true"`.
- **Critical**: post text on X must NOT include a URL. Use the image as primary content; let people search the headline or visit the profile bio link. URL-in-body costs $0.20 vs $0.015.
- Use the same image asset (1200×675 is optimal for both platforms).

Mastodon would be the same pattern but ~50 lines and $0 — could be v1.1 if useful.

---

## 15. Open decisions for operator review

1. **Card text in the post body.** Two options:
   - **(A) Just `card.big`** — clean, image-centric, mimics great editorial accounts. Recommended.
   - **(B) `card.big` + URL + ` · #issue{id} #malaysia`** — adds discoverability via hashtags.
   - Bluesky hashtag culture is mild; either works. Pick one.

2. **Posts per day target.** I've defaulted to **7**. Acceptable range from the conversation was "at least 5", upper soft cap from policy is ~10/day. Want me to raise/lower?

3. **MYT posting window.** Default **08:00–22:00**. Want narrower (09–21) to be safer, or wider to catch night owls?

4. **Cooldown between posts.** Default **75 min**. Lower means burstier and more human-feeling at the extremes; higher is safer for duplicate-content auto-flag (though Bluesky has no such system today).

5. **Fallback if no card scores ≥4.** Default: **skip the slot**. Alternative: **pick the highest-scoring unposted card regardless**. Skipping protects credibility on quiet news days but means some days hit 3–4 posts instead of 7.

6. **`cards:index` distribution.** Two options:
   - **(A) KV** — populate via GitHub Action post-deploy. Cleaner runtime, one extra CI step.
   - **(B) Pages static** — Worker fetches `public/social-card-index.json` on cold start, caches in module scope. No CI step, slight cold-start cost.
   - Recommend (A) — KV is what it's for.

7. **Should the bot link back to the site URL in every post?** Per Bluesky there's no penalty for URLs, but some accounts feel less spammy without. Recommendation: yes, link back — drives traffic, the whole point of having a bot.

8. **Image style for the card.** The mockup in §10 is a one-shot. Want a quick comp before we build, or trust the design and iterate after first deploys?

---

## 16. Effort estimate

| Phase | Work | Wall time |
|---|---|---|
| Build script `build-social-cards.mjs` + image template | small | 2–3h |
| Worker scaffold, KV schema, scheduler | small | 2h |
| Trend ingest + scorer | medium | 3–4h |
| Bluesky client | small | 2h |
| First deploy + smoke test | small | 1h |
| Tune based on first week of posts | small | 1–2h |

Total: **~12 hours** of focused work. Realistically across a few sessions.

---

## 17. Sustainability check

- All runtime services on Cloudflare free tier with 80%+ headroom.
- All trend signals free, no API keys to expire.
- App Password is revocable any time as a kill switch.
- No external dependencies that could vanish (atproto is open spec; even if `bsky.social` PDS changed terms, the protocol is portable).
- If Bluesky tightens posting rate limits, current limit (1,666/hour) is 240× our load.

Green light from a sustainability angle. Single largest risk is the operator deciding to add X and paying for it.
