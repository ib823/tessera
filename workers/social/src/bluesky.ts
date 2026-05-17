/**
 * Bluesky AT Protocol client — minimal, direct fetch (no SDK).
 *
 * Auth: createSession → cache session in KV with 110-min TTL.
 * Post: uploadBlob (image) → createRecord (post with embedded image).
 */
import type { BlueskySession, Env, SocialCard } from './types';
import { clearSession, getSession, putSession } from './kv';

interface CreateSessionResponse {
  accessJwt: string;
  refreshJwt: string;
  did: string;
  handle: string;
  active?: boolean;
}

interface UploadBlobResponse {
  blob: {
    $type: 'blob';
    ref: { $link: string };
    mimeType: string;
    size: number;
  };
}

interface CreateRecordResponse {
  uri: string;
  cid: string;
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '<no body>');
    throw new Error(`Bluesky ${res.status} ${url}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

async function createSession(env: Env): Promise<BlueskySession> {
  const body = JSON.stringify({
    identifier: env.BLUESKY_IDENTIFIER,
    password: env.BLUESKY_APP_PASSWORD,
  });
  const r = await fetchJson<CreateSessionResponse>(
    `${env.BLUESKY_PDS}/xrpc/com.atproto.server.createSession`,
    { method: 'POST', headers: { 'content-type': 'application/json' }, body },
  );
  const session: BlueskySession = {
    accessJwt: r.accessJwt,
    refreshJwt: r.refreshJwt,
    did: r.did,
    handle: r.handle,
    expiresAt: Date.now() + 110 * 60 * 1000,
  };
  await putSession(env, session);
  return session;
}

async function getOrCreateSession(env: Env): Promise<BlueskySession> {
  const cached = await getSession(env);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached;
  return createSession(env);
}

async function uploadBlob(env: Env, session: BlueskySession, imageBuf: ArrayBuffer): Promise<UploadBlobResponse> {
  return fetchJson<UploadBlobResponse>(`${env.BLUESKY_PDS}/xrpc/com.atproto.repo.uploadBlob`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.accessJwt}`,
      'content-type': 'image/png',
    },
    body: imageBuf,
  });
}

function buildPostText(card: SocialCard, siteUrl: string): string {
  // The image already carries the statement (card.big) and the brand
  // attribution. Post text is just the deep link so feed readers can click
  // through without the statement being duplicated in both surfaces.
  return `${siteUrl}/issue/${card.issueId}`;
}

function findUrlFacets(text: string): unknown[] {
  // AT Proto requires URL byte ranges as "facets" so clients render them as links.
  const utf8 = new TextEncoder().encode(text);
  const decoder = new TextDecoder();
  const facets: unknown[] = [];
  const urlRe = /https?:\/\/[^\s]+/g;
  let m: RegExpExecArray | null;
  // Operate on the raw string but compute byte offsets correctly for Unicode.
  while ((m = urlRe.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const byteStart = new TextEncoder().encode(text.slice(0, start)).length;
    const byteEnd = new TextEncoder().encode(text.slice(0, end)).length;
    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: m[0] }],
    });
  }
  // Silence unused-var warnings without spending cycles.
  void utf8;
  void decoder;
  return facets;
}

async function createRecord(
  env: Env,
  session: BlueskySession,
  text: string,
  blob: UploadBlobResponse['blob'],
  altText: string,
): Promise<CreateRecordResponse> {
  const record = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    langs: ['en'],
    facets: findUrlFacets(text),
    embed: {
      $type: 'app.bsky.embed.images',
      images: [
        {
          image: blob,
          alt: altText.slice(0, 1000),
          aspectRatio: { width: 1080, height: 1350 },
        },
      ],
    },
  };
  return fetchJson<CreateRecordResponse>(
    `${env.BLUESKY_PDS}/xrpc/com.atproto.repo.createRecord`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${session.accessJwt}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record,
      }),
    },
  );
}

export interface PostResult {
  uri: string;
  cid: string;
  did: string;
}

export async function postCardToBluesky(env: Env, card: SocialCard): Promise<PostResult> {
  let session = await getOrCreateSession(env);

  const imageUrl = `${env.SITE_URL}${card.imagePath}`;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(`Image fetch ${imgRes.status} for ${imageUrl}`);
  }
  const imgBuf = await imgRes.arrayBuffer();
  if (imgBuf.byteLength > 950_000) {
    // Bluesky max is 1MB. JPGs are well under but guard anyway.
    throw new Error(`Image too large: ${imgBuf.byteLength} bytes`);
  }

  let blob: UploadBlobResponse;
  try {
    blob = await uploadBlob(env, session, imgBuf);
  } catch (err) {
    // If the session 401s, force a re-auth once and retry.
    if (err instanceof Error && /\b401\b/.test(err.message)) {
      await clearSession(env);
      session = await createSession(env);
      blob = await uploadBlob(env, session, imgBuf);
    } else {
      throw err;
    }
  }

  const text = buildPostText(card, env.SITE_URL);
  // Alt text mirrors the image content — the statement only, since the image
  // shows nothing else readable beyond brand attribution.
  const altText = card.big;

  const record = await createRecord(env, session, text, blob.blob, altText);
  return { uri: record.uri, cid: record.cid, did: session.did };
}
