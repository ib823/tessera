# Data inventory: what The Fourth Angle collects, stores and sends

**Status:** internal working document, prepared 8 November 2026 from the code at commit `2a9302b5`. Not reader-facing. It is the factual basis for `privacy-notice.md`.

**Method:** every row below was traced in the source, not assumed. Paths are relative to the repository root. Where a behaviour depends on settings that live outside the repository (the Cloudflare dashboard, Cloudflare's own systems, browser vendors' push services), the row says so.

**Scope:** the website (Astro static build in `src/` and `public/`), the service worker (`public/sw.js`), the sync worker (`workers/sync/`), the push-notification worker (`workers/notify/`), and the social-posting worker (`workers/social/`, which handles no reader data).

---

## 1. Headline facts

1. **Reading history stays on the device unless the reader opts into Angle Code sync.** With sync on, the reading state for each issue, highlights and last position go to Cloudflare Workers KV. The record expires 90 days after the *last* sync activity from any linked device, not 90 days after creation, because every push, pull and merge resets the timer. There is no delete endpoint. "Unlink" only removes the code from the current browser.
2. **Push notifications store the full browser push subscription (endpoint URL plus two encryption keys) on the server with no expiry.** A "last seen" timestamp is updated every time the app opens. A separate `reengaged:` marker is written for inactive subscribers and is never deleted, even after unsubscribe.
3. **Opening a link containing `?sync=CODE` links the browser to that code immediately, with no confirmation**, merges that code's history into the browser, and uploads the browser's own reading history to that code. Whoever created the code can then read it.
4. **The "Clear all reading data" button in the Angle Code panel does not clear reading data.** It deletes only keys with the legacy `tfa-` prefix, but all reading data was migrated to the `tfa:v1:` prefix. The control that works is on `/progress`, and nothing on the site links to that page.
5. **No analytics, no advertising trackers, no third-party scripts and no cookies are set by the site's code.** The Content Security Policy enforces this in the browser. Cloudflare, as host, processes request data, including IP addresses, under its own privacy policy. Whether Cloudflare Workers Logs is retaining request logs for the two workers is a dashboard setting not visible in the repository.

---

## 2. Data on the reader's device: `localStorage`

These persist until the reader clears them. "Leaves the device" means sent over the network by the site's code.

| # | Data item | Where stored | Purpose | Retention (as the code shows) | Leaves the device? | Code reference |
|---|---|---|---|---|---|---|
| L1 | Reading state per issue, key `tfa:v1:read:<issue id>`, value `{state: "started" or "completed", progress: <card count>}` | Device | Show read/started markers; resume reading; show the push prompt only after one completed issue; after 10 completed issues, reorder unread issues by topic affinity (see L1a) | No expiry | Only if Angle Code sync is on (V1) | `src/stores/reader.ts:8`, `src/stores/reader.ts:18-33`, `src/lib/reading-state.ts:317-329`, `src/components/PushPrompt.svelte:40-46` |
| L1a | Topic-affinity ordering, computed from L1 and L2 (not stored separately) | Device (in memory) | After 10 completed issues, unread issues are ordered by the lenses of issues read and highlighted. Used for the feed list and next/previous navigation | Recomputed on each load | No | `src/components/App.svelte:276-294`, `src/components/App.svelte:305-324`, `src/stores/reader.ts:115-144` |
| L2 | Highlights ("this insight hit hard"), key `tfa:v1:reactions`, value: issue id mapped to highlighted card indices | Device | Show highlight markers; input to L1a | No expiry | Only if sync is on (V1) | `src/stores/reader.ts:36-65` |
| L3 | Last reading position, key `tfa:v1:pos`, value `{feedIssueId, cardIndex, ts}` | Device | Resume where the reader left off | Ignored after 24 hours but stays stored until overwritten or cleared | Only if sync is on (V1) | `src/stores/reader.ts:85-103`, `src/lib/sync.ts:134-140` |
| L4 | Notification inbox, key `tfa:v1:notifications`: up to 50 items `{id, title, body, issueId, url, timestamp, read}` | Device | In-app list of push notifications received | Items older than 30 days are hidden on read and dropped on the next write; capped at 50 | No (included in the export file, O3) | `src/stores/notifications.ts:16-44`, `src/stores/notifications.ts:90-92`, `src/components/App.svelte:460-469`, `public/sw.js:113-123` |
| L5 | Angle Code, key `tfa:v1:angle-code` (6 characters from a 32-character alphabet) | Device | Identifies the reader's sync record | Until unlinked or cleared | Yes, with every sync request. For pulls it travels in the URL query string | `src/lib/sync.ts:18`, `src/lib/sync.ts:30-42`, `src/lib/sync.ts:170`, `src/lib/sync.ts:196`, `src/lib/sync.ts:213` |
| L6 | Last sync time, key `tfa:v1:last-sync` | Device | Decide when to pull again; show "synced" status | Until unlinked or cleared | No | `src/lib/sync.ts:19`, `src/lib/sync.ts:48-56`, `src/lib/sync.ts:142` |
| L7 | Device identifier, key `tfa:v1:device-id` (`d_` plus 16 random hex characters) | Device | Shown on `/progress`; used in the export file name | Until cleared. Created when the `/progress` panel first opens | No network transmission found. Included in the export file (O3) | `src/lib/reading-state.ts:371-381`, `src/components/ReadingProgressPanel.svelte:39`, `src/components/ReadingProgressPanel.svelte:59`, `src/components/ReadingProgressPanel.svelte:130`. A second generator at `src/lib/sync.ts:58-68` is never called |
| L8 | Push-subscribed flag, key `tfa:v1:push-subscribed` | Device | Remember that notifications are on | Until unsubscribed or cleared | No | `src/components/PushPrompt.svelte:95`, `src/components/NotificationBell.svelte:106`, `src/components/NotificationBell.svelte:135` |
| L9 | Copy of the push endpoint URL, key `tfa:v1:push-endpoint` | Device | Sent as a heartbeat so the server can update "last seen" (N2) | Until unsubscribed or cleared | Yes, to the push worker on every app load while push is on | `src/components/PushPrompt.svelte:96`, `src/components/NotificationBell.svelte:107`, `src/components/NotificationBell.svelte:136`, `src/components/App.svelte:477-481`, `public/sw.js:177-185` |
| L10 | Push prompt dismissed, key `tfa:v1:push-dismissed` (timestamp) | Device | Hide the prompt for 7 days | Until cleared | No | `src/components/PushPrompt.svelte:37-38`, `src/components/PushPrompt.svelte:106` |
| L11 | Install prompt dismissed, key `tfa:v1:install-dismissed` (`1` or a timestamp) | Device | Hide the install prompt (30-day cooldown on iOS) | Until cleared | No | `src/lib/install-state.ts:14`, `src/lib/install-state.ts:32`, `src/lib/install-state.ts:82`, `src/components/InstallPrompt.svelte:23-24`, `src/components/InstallPrompt.svelte:60` |
| L12 | Sync banner dismissed, key `tfa:v1:sync-banner-dismissed` | Device | Hide the banner | Until cleared | No | `src/components/App.svelte:141-143` |
| L13 | Sync prompt dismissed, key `tfa:v1:sync-prompt-dismissed` | Device | Hide the mobile sync card | Until cleared | No | `src/components/MobileDock.svelte:31`, `src/components/MobileDock.svelte:44`, `src/components/MobileDock.svelte:60` |
| L14 | Welcome card dismissed, key `tfa:v1:welcome-dismissed` | Device | Show the welcome card once | Until cleared | No | `src/components/TodayView.svelte:131-132` |
| L15 | Migration flag, key `tfa:v1:migrated` | Device | Run the legacy-key migration once | Until cleared | No | `src/lib/reading-state.ts:65`, `src/lib/reading-state.ts:236`, `src/lib/reading-state.ts:299` |
| L16 | Storage probe, key `__tfa_probe__` | Device | Test whether storage works | Written and deleted immediately | No | `src/lib/reading-state.ts:129-133` |
| L17 | Legacy keys `tfa-*` (pre-April 2026 names for L1 to L14) | Device | None now | Copied to `tfa:v1:*` and deleted on first load | No | `src/lib/reading-state.ts:31-46`, `src/lib/reading-state.ts:242-296` |

## 3. Data on the reader's device: `sessionStorage`

Cleared by the browser when the tab closes. None of it leaves the device.

| # | Data item | Where stored | Purpose | Retention | Leaves the device? | Code reference |
|---|---|---|---|---|---|---|
| S1 | `tfa-cinema-dismissed` | Device | Keep Cinema Mode dismissed for the tab | Tab session | No | `src/components/App.svelte:107-119` |
| S2 | `tfa-sw-build` (site build id) | Device | Reload once when a new service worker takes over | Tab session | No | `src/layouts/Base.astro:99-116`, `src/pages/issue/[id].astro:370-387` |
| S3 | `tfa_swipe_hint_shown` | Device | Show the swipe hint once per tab | Tab session | No | `src/components/InsightReader.svelte:852-855` |
| S4 | `tfa_entry_seen` | Device | Play the card entry animation once per tab | Tab session | No | `src/components/DesktopCard.svelte:40-51` |
| S5 | `fa-anim-tier`, derived from CPU core count, device-memory hint and reduced-motion setting | Device | Pick an animation level the device can handle | Tab session | No | `src/lib/animation.ts:131-146` |

## 4. Other data on the device

| # | Data item | Where stored | Purpose | Retention | Leaves the device? | Code reference |
|---|---|---|---|---|---|---|
| O1 | Cache Storage `tfa-static-v13`: offline page, two icons, hashed scripts/styles, fonts | Device | Offline fallback and speed | Replaced when the cache name changes; old caches deleted on activation | No | `public/sw.js:1-2`, `public/sw.js:20-34`, `public/sw.js:52-84` |
| O2 | Browser push subscription (endpoint URL, `p256dh` and `auth` keys) and notification permission | Device (held by the browser) | Receive notifications | Until the reader turns notifications off or clears site data | Yes: posted to the push worker on subscribe (N1) | `src/components/PushPrompt.svelte:61-91`, `src/components/NotificationBell.svelte:81-101` |
| O3 | Exported reading-progress file (JSON download): device id, reading states, highlights, position, **Angle Code**, last sync, notification inbox, dismissal flags **including the push endpoint** | Device (the reader's downloads) | Backup and moving progress between browsers | Until the reader deletes the file | Only if the reader shares the file | `src/lib/reading-state.ts:435-461`, `src/components/ReadingProgressPanel.svelte:51-63` |
| O4 | Angle Code or sync link copied to the clipboard or the system share sheet | Device | Let the reader link another device | Reader-controlled | Only where the reader sends it | `src/components/AngleCode.svelte:88-107` |
| O5 | Device signals read but not stored: user agent and platform (iOS detection), display mode, reduced-motion preference | Device (in memory) | Decide whether to show install and push prompts | Not stored | No | `src/lib/install-state.ts:24-30`, `src/components/PushPrompt.svelte:21-23`, `src/components/NotificationBell.svelte:60-62` |

## 5. Data on servers: Angle Code sync worker (`tfa-sync`, KV binding `SYNC`)

| # | Data item | Where stored | Purpose | Retention (as the code shows) | Leaves the device? | Code reference |
|---|---|---|---|---|---|---|
| V1 | Sync record, key `angle:<CODE>`, value `{readMap: {issue id: {state, progress}}, reactions: {issue id: [card indices]}, position: {feedIssueId, cardIndex, ts} or null, lastSync}` | Server (Cloudflare Workers KV) | Cross-device reading continuity | KV TTL of 90 days, **reset on every create, push, pull and merge**, so it is deleted 90 days after the last sync activity from any linked device. No delete endpoint exists. Unlink removes only the local code | Yes | `workers/sync/src/index.ts:19-28`, `workers/sync/src/index.ts:165-166`, `workers/sync/src/index.ts:206-208`, `workers/sync/src/index.ts:234-236`, `workers/sync/src/index.ts:259-262`, `workers/sync/src/index.ts:286-288`, routes at `workers/sync/src/index.ts:192-298`, local unlink at `src/lib/sync.ts:38-42` |
| V1a | Who can read V1 | n/a | n/a | n/a | Anyone who holds the code can pull the whole record. The code is a bearer secret | `workers/sync/src/index.ts:242-265` |
| V2 | Client IP address (`CF-Connecting-IP`) in in-memory rate-limit maps | Server (worker memory only) | Rate limiting (30 requests a minute; 5 pulls a minute) | Not written to KV. Entries are overwritten per IP but never purged by the code, so they last until Cloudflare recycles the isolate. The code does not show how long that is | Yes | `workers/sync/src/index.ts:79-112` |
| V3 | Request URL containing the Angle Code (`GET /api/sync/pull?token=...`) | Server (Cloudflare request handling and any logs) | Side effect of the pull design | **Not shown by the code.** `workers/sync/wrangler.toml` has no `[observability]` block. Cloudflare's documentation says newly created Workers have logging on by default, kept 3 days (Free) or 7 days (Paid). Check the dashboard | Yes | `src/lib/sync.ts:170`, `src/lib/sync.ts:213`, `workers/sync/wrangler.toml:1-10` |
| V4 | `?sync=CODE` links | Server (Cloudflare Pages request) then device | Link a second device | The page request carries the code to Cloudflare before client code strips it from the address bar | Yes | Created at `src/components/AngleCode.svelte:96`; consumed and **auto-linked without confirmation** at `src/components/App.svelte:416-418`; stripped at `src/lib/sync.ts:282-295`; link-and-upload at `src/lib/sync.ts:165-184` |

**Where KV data physically sits:** Cloudflare's documentation says KV "stores data in a small number of centralized data centers" and caches it in other data centres after access. The repository does not show which countries. It is reasonable to assume storage outside Malaysia (relevant to PDPA s.129).

## 6. Data on servers: push-notification worker (`tfa-notify`, KV binding `SUBS`)

| # | Data item | Where stored | Purpose | Retention (as the code shows) | Leaves the device? | Code reference |
|---|---|---|---|---|---|---|
| N1 | Push subscription, key `sub:<ms timestamp>_<last 20 alphanumeric chars of endpoint>`, value `{endpoint, keys: {p256dh, auth}, subscribedAt, lastSeen, platform}`. `platform` is derived from the endpoint host | Server (Cloudflare Workers KV) | Send notifications | **No TTL.** Deleted on unsubscribe, or when a new-issue push gets HTTP 404/410 from the push service. Not deleted when a digest or re-engagement push fails. Each subscribe writes a new key without checking for an existing record, and unsubscribe deletes only the first match, so a stale duplicate can remain until the next failed new-issue push | Yes | `workers/notify/src/index.ts:15-28`, `workers/notify/src/index.ts:397-406`, `workers/notify/src/index.ts:414-435`, `workers/notify/src/index.ts:302-304`, `workers/notify/src/index.ts:500-511`, `workers/notify/src/index.ts:533-535`, `workers/notify/src/index.ts:557-559` |
| N2 | `lastSeen` timestamp inside N1, updated by heartbeat | Server | Decide who gets a "You Missed This" re-engagement push (inactive more than 14 days) | Overwritten on each app load while push is on | Yes | `workers/notify/src/index.ts:437-458`, `workers/notify/src/index.ts:538-561`, `src/components/App.svelte:477-481`, `public/sw.js:177-185` |
| N3 | Re-engagement marker, key `reengaged:<N1 key>`, value: timestamp | Server | Limit re-engagement pushes to one per 30 days | **No TTL and never deleted**, including after unsubscribe or expiry cleanup | Yes | `workers/notify/src/index.ts:554-559`; unsubscribe deletes only the N1 key at `workers/notify/src/index.ts:427` |
| N4 | CSP violation report, key `csp:<ms timestamp>`, value `{blockedUri, violatedDirective, documentUri (query string removed), ts}` | Server | Security monitoring | 30-day TTL. No IP stored. **Uncertain whether any are stored:** POST requests without an allowed `Origin` header are rejected before the CSP handler runs; whether browsers send `Origin` on `report-uri` requests was not verified | Yes (sent automatically by the browser) | `public/_headers:7` (`report-uri`), `workers/notify/src/index.ts:576-580`, `workers/notify/src/index.ts:601-622` |
| N5 | Client IP address in in-memory rate-limit maps | Server (worker memory only) | Rate limiting (10 a minute general; subscribe 5 an hour; unsubscribe 10 an hour) | As V2 | Yes | `workers/notify/src/index.ts:63-94` |
| N6 | Notification payload (issue headline, context, link, icon) sent through the browser vendor's push service (Google FCM, Mozilla, Apple, Microsoft) | Third-party push service, then device | Deliver the notification | Push service may hold an undelivered message up to 24 hours (`TTL: 86400`). Payload is encrypted end to end (RFC 8291) and contains no reader data | Not reader data | `workers/notify/src/index.ts:96-102`, `workers/notify/src/index.ts:189-310`, `workers/notify/src/index.ts:314-364` |
| N7 | Worker error logs (push failure status and response body) | Server (Cloudflare) | Debugging | **Not shown by the code**; see V3 | n/a | `workers/notify/src/index.ts:298-301`, `workers/notify/src/index.ts:306-308` |
| N8 | `meta:issueCount` | Server | Detect new issues | Overwritten | Not reader data | `workers/notify/src/index.ts:484-490`, `workers/notify/src/index.ts:514` |

**Sending schedule as coded** (`workers/notify/wrangler.toml:6-10`, `workers/notify/src/index.ts:627-652`): Tuesday and Thursday 08:00 MYT (new-issue alert, only if new issues exist), Saturday 09:00 MYT (weekly digest), and daily 09:00 MYT (re-engagement push to subscribers inactive more than 14 days, at most once per 30 days each). An inactive subscriber can therefore get four pushes in one week. Both Saturday triggers fire at 01:00 UTC and the handler routes both to the digest, so the digest may be sent twice. The shared `weekly-digest` tag and topic probably collapse it into one on the device.

## 7. Hosting and third parties

| # | Data item | Where stored | Purpose | Retention | Leaves the device? | Code reference |
|---|---|---|---|---|---|---|
| H1 | Standard request data (IP address, user agent, URL including query strings such as `?from=notification`, `?from=digest`, `?from=re-engage`, `?sync=CODE`) received by Cloudflare Pages | Server (Cloudflare) | Serving and securing the site | **Not shown by the code.** Cloudflare's privacy policy (effective 4 November 2025) names it a data processor for customer and end-user content and says it processes IP addresses and traffic data. No client code reads `from` | Yes | `public/_headers:1-10`, `workers/notify/src/index.ts:320`, `workers/notify/src/index.ts:351`, `workers/notify/src/index.ts:362`, `src/components/AngleCode.svelte:96` |
| H2 | No analytics, ad trackers or third-party scripts. CSP limits scripts to the site itself (plus inline hashes) and network connections to the site and the two workers | n/a | n/a | n/a | n/a | `public/_headers:7`; repository-wide search found no analytics libraries |
| H3 | No cookies set by site code | n/a | n/a | n/a | n/a | `public/_headers:1-10` sets no cookie headers, and a search for `document.cookie` and `cookieStore` in `src/` found none. Cloudflare dashboard features (bot protection, for example) can set their own cookies; not visible in the repository |
| H4 | Fonts and icons self-hosted | Device cache | n/a | n/a | No third-party request | `src/layouts/Base.astro:41-42`, `public/_headers:7` (`font-src 'self'`) |
| H5 | Share buttons (WhatsApp, Telegram, X, Facebook, LinkedIn, Threads) | Third party | Reader-initiated sharing | n/a | Only when the reader clicks; the chosen platform receives the issue link and text | `src/components/ShareModal.svelte:136`, `src/components/ShareModal.svelte:151-158`, `src/components/ShareModal.svelte:167-169` |
| H6 | Social-posting worker: fetches public news feeds and posts issue cards to Bluesky (Mastodon optional) | Server | Distribution | Trend snapshots kept with a TTL | **No reader data.** Its user-agent string advertises `/contact`, which does not exist | `workers/social/src/trends.ts:13-28`, `workers/social/src/kv.ts:37-38` |

## 8. Reader controls: what each one actually does

| Control | Where | What it removes | What it does not remove | Code reference |
|---|---|---|---|---|
| "Clear" on `/progress` | `/progress` page, **not linked from anywhere** in `src/` | Every `tfa:v1:*` and `tfa-*` key (L1 to L17), including the local Angle Code and push flags | Server sync record (V1); server push subscription (N1, N3); the browser's push subscription | `src/lib/reading-state.ts:544-553`, `src/components/ReadingProgressPanel.svelte:96-107`, `src/pages/progress.astro:1-17` |
| "Clear all reading data" in the Angle Code panel | Angle Code panel (shown only when linked) | The Angle Code and last-sync time, plus any legacy `tfa-` keys | **Reading states, highlights, position, notification inbox** (all now under `tfa:v1:`). This is a bug | `src/components/AngleCode.svelte:133-144`, `src/components/AngleCode.svelte:201-207` |
| "Unlink" | Angle Code panel | The Angle Code and last-sync time on this device | The server record, which lasts 90 days from the last sync activity | `src/lib/sync.ts:38-42`, `src/components/AngleCode.svelte:109-123` |
| "Turn off" notifications | Notification bell panel | The browser subscription, the server N1 record (first match), local flags | N3 marker; any duplicate N1 record | `src/components/NotificationBell.svelte:115-142`, `workers/notify/src/index.ts:414-435` |
| "Clear all" notifications | Notification bell panel | The local inbox (L4) | n/a | `src/stores/notifications.ts:90-92`, `src/components/NotificationBell.svelte:191-194` |
| Browser "clear site data" | Browser settings | Everything on the device, including the service worker and, in most browsers, the push subscription | N1 lasts until the next new-issue push fails; V1 lasts 90 days; N3 indefinitely | Browser behaviour; server side at `workers/notify/src/index.ts:302-304` |

## 9. Where current public statements differ from the code

| Statement | Location | What the code does |
|---|---|---|
| "No user accounts, no tracking, no third-party analytics, no personally identifiable information collected." | `src/pages/disclaimer.astro:114` | No names or emails are collected. Push subscription records (endpoint plus keys plus last seen) are kept on the server indefinitely, and the page does not mention them. Whether they are "personal data" under PDPA s.4 is a question for counsel |
| "Sync data is stored on Cloudflare Workers KV with a 90-day expiry and is automatically deleted after that period." | `src/pages/disclaimer.astro:116` | 90 days from the last sync activity, not from creation |
| "...your Angle Code can be permanently deleted by contacting thefourthangle@proton.me." | `src/pages/disclaimer.astro:116` | No delete endpoint exists. Deletion requires the operator to delete the KV key by hand |
| Sync stores "which issues you have opened, your reading position (card 1–7), and which cards you have highlighted." | `src/pages/disclaimer.astro:116` | Also stores started/completed state, progress count, the position timestamp and the last-sync timestamp |
| Push notifications and CSP reports | `src/pages/disclaimer.astro:113-117` | Not mentioned anywhere on the site |
| "No account. No personal data. 90-day auto-delete." | `src/components/AngleCode.svelte:198` | Same points as above |
| "Get notified when new issues drop. Max 3/week." | `src/components/PushPrompt.svelte:116` | Up to four in a week for inactive subscribers, plus a possible duplicate digest (section 6) |
| "Nothing is transmitted unless you explicitly opt into Angle Code sync." | `src/pages/progress.astro:10` | Push notifications, a separate opt-in, transmit the endpoint on every app load |
| "Clear all reading data" | `src/components/AngleCode.svelte:206` | Does not clear reading data (section 8) |
| Internal rule: "No algorithmic personalization of the feed. Every reader sees the same issues." | Repository editorial guidelines, "Ethical lines" | Every reader sees the same issues, but after 10 completed issues the unread ones are reordered on the device by reading history (L1a). Nothing leaves the device |

## 10. What the code does not show

- **Cloudflare log retention** for Pages and for the two workers (dashboard settings; no `[observability]` block in either `wrangler.toml`).
- **Physical location** of KV storage and of Cloudflare's logs.
- **Isolate lifetime**, which bounds how long IP addresses stay in rate-limit memory (V2, N5).
- **Whether browsers' CSP reports pass the `Origin` check** (N4), and so whether any are stored.
- **Number of sync records and push subscriptions** in KV. This matters for the DPO thresholds discussed in `privacy-notice.md`. The owner can count keys with `wrangler kv key list`.
- **Whether Cloudflare dashboard features set cookies** (H3).
- **Retention by browser vendors' push services** beyond the 24-hour message TTL the worker sets.
- **Who operates the site and where they are established.** This decides whether PDPA applies (s.2(2)) and is for the owner to supply.

## 11. Engineering changes that would simplify the privacy notice (suggested, not made)

1. Ask for confirmation before linking from a `?sync=` URL (`src/components/App.svelte:416-418`).
2. Fix the Angle Code panel's clear button to call `clearAll()` from `src/lib/reading-state.ts`, and link `/progress` from the info menu.
3. Add a sync delete endpoint, and make "Unlink" offer "unlink and delete from server".
4. Move the Angle Code from the pull URL query string into a POST body or header, so it stays out of request logs.
5. Add a TTL to push subscriptions (for example, refreshed by heartbeat), delete the `reengaged:` key on unsubscribe and on expiry, and de-duplicate subscriptions by endpoint.
6. Align the notification cap with the "Max 3/week" promise, or change the promise. Route the two Saturday triggers by `event.cron`.
7. Decide whether the on-device topic ordering (L1a) stays, given the "no algorithmic personalization" rule.
