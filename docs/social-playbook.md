# T4A Social Playbook — Bluesky, Mastodon, X

Three channels, two modes. **Bluesky + Mastodon are automated** (free APIs, the
`tfa-social` Worker posts on a coin-flip schedule inside the posting window). **X
is manual** — the X API is metered/paid on `console.x.com`, so T4A never touches
it programmatically; the operator posts by hand using the draft helper below.

| Channel | Mode | Cost | Notes |
|---------|------|------|-------|
| Bluesky | automated | free | Live. `bluesky.ts`, session cached in KV. |
| Mastodon | automated | free | `mastodon.ts`, gated by `ENABLE_MASTODON`. One long-lived token. |
| X | **manual** | free (no API) | Use `/admin/x-draft`. Posted by hand for reach + reactivity. |

---

## When to post (Malaysia time, UTC+8)

The notification CRON publishes issues for **Tue / Thu 08:00 and Sat 09:00 MYT**.
Post the new issue to each channel in that morning window while it is freshest.

**Prime windows (all MYT):**
- **07:00–10:00** — commute scroll. Best for a freshly published issue, especially on a notification morning.
- **12:30–14:00** — lunch scroll. Good for a single punchy post or a quote.
- **20:30–22:30** — strongest for considered / political threads; people actually read at night.

**The reactive multiplier (the whole point of manual X):** when an issue's topic is
*live in the news that day*, post it **then**, not on schedule. A budget-cut issue
the morning it is debated in Dewan Rakyat beats any fixed slot. The radar's
`silence-watch.md` and trend snapshot are your "what's heating up" feed — glance,
then ride the wave.

**Cadence:** at most ~1 substantive post per day per channel. Consistency beats
volume; over-posting the same account suppresses reach everywhere.

---

## What to post

The cards are engineered for this. Exploit their structure rather than rewriting.

1. **Lead with the `hook` or `reframe`, never the headline.** The headline is
   topic-first and neutral; the hook/reframe carry the tension that stops a scroll.
2. **Thread it on X.** Post 1 = hook (no link). Replies = fact cards → reframe →
   (analogy) → view. Each card big is already ≤180 chars — pre-built tweet length.
3. **Link goes in the LAST post only.** X suppresses reach on first-posts that
   carry an outbound link. Hook leads clean; the view post carries the link + CTA.
4. **Attach the OG image** to post 1 (the draft helper returns its URL). On Bluesky
   and Mastodon the auto-poster already embeds it.
5. **The `view` card is your quote-bait** — it passes the WhatsApp test by design,
   so it is the most reshareable single line. Sometimes post just the view + link.
6. **Match emotion to the issue:** anger-at-process / anxiety-of-precedent over
   sadness (Berger-Milkman). Lead with the process gap ("no audit", "62% fixed"),
   not the sad outcome.

**The one discipline:** manual = freedom to be *timely*, not freedom to be *sharper
than the issue*. Never write an X hook stronger than the card it links to — the
non-partisan credibility model depends on the post matching the verified content.

---

## How to draft an X thread (10-second copy-paste)

The Worker exposes a gated helper (no X API call — it just formats the issue):

```
GET https://<worker-host>/admin/x-draft?id=2001&secret=<ADMIN_SECRET>
GET https://<worker-host>/admin/x-draft?id=2001&secret=<ADMIN_SECRET>&format=text
```

- `format=text` returns a phone-friendly block: each post numbered, divided by a
  rule, with notes ("attach image here", "link only here") and the posting-time
  advice for the current moment.
- JSON form returns `{ posts[], imageToAttach, timing, copyPaste }`.

Then: open X, paste post 1 (attach the image), add each subsequent post as a reply,
put the link only on the final (view) post. Done.

---

## OpSec — non-negotiable for manual X (and any Meta channel, if ever added)

The published site and repo are clean (no AI fingerprint, pseudonymous authorship,
secrets out of the repo, image EXIF stripped). The residual risk is **account- and
device-level**, which no code controls. For manual X:

- **Never co-mingle identities on one device/browser/session.** Posting bot-X and
  browsing a personal account in the same browser links them by cookie + device
  fingerprint regardless of VPN.
- **A shared VPN exit IP between personas is a *linking* signal, not protection.**
  Use a distinct browser profile / device for the T4A persona; if possible a
  different VPN exit than personal browsing.
- **Kill switch ON, split tunneling OFF** in the VPN.
- **Never the personal phone number** on any T4A social account; use the
  pseudonymous Proton identity, not a real-name email.
- VPN defends against the network, never against a platform you are logged into.
  Treat X as "reasonably pseudonymous", not anonymous — the X dev account is already
  phone-verified, so minimise reliance on it.

Threads/Meta were evaluated and **dropped**: automating them forces an
Instagram-inside-Meta identity chain (strongest device/phone graph in the industry),
a larger exposure than the open networks. Bluesky + Mastodon hold little on the
operator by design; that is why they are the automated core.
