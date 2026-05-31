/**
 * Mastodon client — minimal, direct fetch (no SDK).
 *
 * Auth: a single long-lived access token (no session/refresh, unlike Bluesky).
 * Post: POST /api/v2/media (image) → POST /api/v1/statuses (status + media_ids).
 *
 * Free: the Mastodon API has no credit/metering system. Cost is RM0 on any
 * instance that lets you register an app (mastodon.social, mastodon.online, etc.).
 *
 * Env:
 *   MASTODON_INSTANCE      e.g. "https://mastodon.social" (no trailing slash)
 *   MASTODON_ACCESS_TOKEN  the access token from your app's "Your access token"
 *   ENABLE_MASTODON        "true" to actually post; anything else = dry skip
 */
import type { Env, SocialCard } from './types';

interface MediaResponse {
  id: string;
  url: string | null;
}

interface StatusResponse {
  id: string;
  url: string;
  uri: string;
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '<no body>');
    throw new Error(`Mastodon ${res.status} ${url}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

function buildStatusText(card: SocialCard, siteUrl: string): string {
  // Mirror the Bluesky approach: the image carries the statement (card.big) and
  // brand attribution, so the status is just the deep link. Mastodon renders a
  // link preview card from the page's Open Graph tags, and the uploaded image
  // is attached as media with the statement as alt text.
  return `${siteUrl}/issue/${card.issueId}`;
}

async function uploadMedia(env: Env, imageBuf: ArrayBuffer, altText: string): Promise<MediaResponse> {
  // Mastodon v2 media endpoint accepts multipart/form-data. The blob filename
  // and content-type matter — the instance sniffs the type from them.
  const form = new FormData();
  form.append('file', new Blob([imageBuf], { type: 'image/png' }), 'card.png');
  form.append('description', altText.slice(0, 1500));
  return fetchJson<MediaResponse>(`${env.MASTODON_INSTANCE}/api/v2/media`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.MASTODON_ACCESS_TOKEN}`,
      // NOTE: do NOT set content-type here; fetch sets the multipart boundary.
    },
    body: form,
  });
}

async function createStatus(
  env: Env,
  text: string,
  mediaId: string | null,
  idempotencyKey: string,
): Promise<StatusResponse> {
  const body: Record<string, unknown> = {
    status: text,
    visibility: 'public',
    language: 'en',
  };
  if (mediaId) body.media_ids = [mediaId];

  return fetchJson<StatusResponse>(`${env.MASTODON_INSTANCE}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.MASTODON_ACCESS_TOKEN}`,
      'content-type': 'application/json',
      // Idempotency-Key prevents a retried request from double-posting the same
      // card (Mastodon dedupes by this key for a short window).
      'idempotency-key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

export interface MastodonPostResult {
  id: string;
  url: string;
}

export async function postCardToMastodon(env: Env, card: SocialCard): Promise<MastodonPostResult> {
  if (!env.MASTODON_INSTANCE || !env.MASTODON_ACCESS_TOKEN) {
    throw new Error('Mastodon not configured (MASTODON_INSTANCE / MASTODON_ACCESS_TOKEN missing)');
  }

  const imageUrl = `${env.SITE_URL}${card.imagePath}`;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(`Image fetch ${imgRes.status} for ${imageUrl}`);
  }
  const imgBuf = await imgRes.arrayBuffer();

  // Media upload is best-effort: if it fails, fall back to a text-only status.
  // The OG link card on the issue page still surfaces the image to readers.
  let mediaId: string | null = null;
  try {
    const media = await uploadMedia(env, imgBuf, card.big);
    mediaId = media.id;
  } catch (err) {
    console.error('Mastodon media upload failed, posting text-only:', (err as Error).message);
  }

  const text = buildStatusText(card, env.SITE_URL);
  // Stable per-card idempotency key so a retry within the same UTC day cannot
  // double-post the same card.
  const idempotencyKey = `t4a-${card.issueId}-${card.cardIndex}-${new Date().toISOString().slice(0, 10)}`;
  const status = await createStatus(env, text, mediaId, idempotencyKey);
  return { id: status.id, url: status.url };
}
