/**
 * Radar ingest — fetches the slim radar-summary that was baked into the
 * deployed site at build time (public/radar-summary.json), and caches it
 * in KV for the scorer's Stage A boost.
 *
 * Called from the per-minute scheduled handler whenever the scheduled
 * minute is a multiple of 15. A fetch failure here is non-fatal — the
 * scorer simply skips the boost when no summary is cached.
 */
import type { Env, RadarSummary } from './types';
import { putRadar } from './kv';

export async function ingestRadar(env: Env): Promise<RadarSummary | null> {
  const url = `${env.SITE_URL}/radar-summary.json`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'user-agent': 'TheFourthAngle-Social/1.0 (+radar-ingest)' },
      // The summary is small (<50 KB) and changes every ~2h. Browser caching
      // upstream is fine; we re-ingest every 15 min anyway.
    });
  } catch (err) {
    throw new Error(`radar fetch failed: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new Error(`radar fetch ${res.status}`);
  }

  const summary = (await res.json()) as RadarSummary;
  if (!summary || typeof summary !== 'object' ||
      !summary.entities || !summary.keywords) {
    throw new Error('radar summary shape invalid');
  }
  await putRadar(env, summary);
  return summary;
}
