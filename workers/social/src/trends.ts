/**
 * Trend ingest — pull Malaysian news from GDELT + 5 RSS feeds, extract
 * entities and keywords, write to KV with 60-min TTL.
 *
 * Called from the per-minute scheduled handler whenever the scheduled
 * minute is a multiple of 15. Per-source failures are isolated; one
 * slow/down outlet never stalls a cycle.
 */
import type { Env, TrendHeadline, TrendSnapshot } from './types';
import { putTrends } from './kv';
import { extractEntitiesFromText } from './cards';

const SOURCES = [
  // GDELT 2.0 DOC API — Malaysia sourcecountry, last 24h, JSON.
  {
    name: 'gdelt',
    kind: 'json' as const,
    url: 'https://api.gdeltproject.org/api/v2/doc/doc?query=sourcecountry:MY%20sourcelang:eng&mode=ArtList&format=json&maxrecords=75&timespan=24h&sort=DateDesc',
  },
  { name: 'malaysiakini', kind: 'rss' as const, url: 'https://www.malaysiakini.com/rss/en/news.rss' },
  { name: 'fmt', kind: 'rss' as const, url: 'https://www.freemalaysiatoday.com/feed/' },
  { name: 'star-nation', kind: 'rss' as const, url: 'https://www.thestar.com.my/rss/news/nation' },
  { name: 'bernama', kind: 'rss' as const, url: 'https://www.bernama.com/en/rssfeed.php' },
  { name: 'malaymail', kind: 'rss' as const, url: 'https://www.malaymail.com/rss' },
];

const FETCH_TIMEOUT_MS = 5000;
const USER_AGENT = 'TheFourthAngle-Trends/1.0 (+https://thefourthangle.pages.dev/contact)';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this',
  'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your',
  'he', 'she', 'his', 'her', 'i', 'me', 'my', 'who', 'what', 'when', 'where', 'why', 'how',
  'not', 'no', 'so', 'if', 'than', 'then', 'also', 'all', 'one', 'two', 'three', 'malaysia',
  'malaysian', 'government', 'people', 'public', 'years', 'year', 'said', 'says', 'about',
  'over', 'after', 'before', 'between', 'into', 'out', 'up', 'down', 'more', 'most',
]);

function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, {
    ...init,
    signal: ctrl.signal,
    headers: { 'user-agent': USER_AGENT, ...(init?.headers || {}) },
  }).finally(() => clearTimeout(t));
}

async function fetchGdelt(url: string): Promise<TrendHeadline[]> {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`gdelt ${res.status}`);
  const data = await res.json<{ articles?: Array<{ title?: string; url?: string; seendate?: string }> }>();
  if (!Array.isArray(data.articles)) return [];
  return data.articles.slice(0, 50).map((a) => ({
    source: 'gdelt',
    title: a.title ?? '',
    url: a.url ?? '',
    publishedAt: a.seendate ?? '',
  })).filter((h) => h.title);
}

function parseRssItems(xml: string, sourceName: string): TrendHeadline[] {
  // Lightweight RSS/Atom parser — extracts <item>/<entry> blocks and their
  // <title>, <link>, <pubDate>/<published>. Good enough for headline ingestion.
  const items: TrendHeadline[] = [];
  const itemRe = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[0];
    const title = extractTag(block, 'title');
    if (!title) continue;
    const link = extractLink(block);
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || '';
    items.push({
      source: sourceName,
      title: stripCdata(title).trim(),
      url: stripCdata(link).trim(),
      publishedAt: pubDate.trim(),
    });
    if (items.length >= 40) break;
  }
  return items;
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? m[1] : '';
}

function extractLink(block: string): string {
  // RSS: <link>http://...</link>; Atom: <link href="..."/>
  const text = extractTag(block, 'link');
  if (text && /^https?:/i.test(text.trim())) return text;
  const attr = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return attr ? attr[1] : '';
}

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
}

async function fetchRss(name: string, url: string): Promise<TrendHeadline[]> {
  const res = await fetchWithTimeout(url, { headers: { accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!res.ok) throw new Error(`${name} ${res.status}`);
  const xml = await res.text();
  return parseRssItems(xml, name);
}

export async function ingestTrends(env: Env): Promise<TrendSnapshot> {
  const results = await Promise.allSettled(
    SOURCES.map((s) => (s.kind === 'json' ? fetchGdelt(s.url) : fetchRss(s.name, s.url))),
  );

  const headlines: TrendHeadline[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      headlines.push(...r.value);
    } else {
      console.warn(`trend source ${SOURCES[i].name} failed:`, r.reason);
    }
  }

  const entities: Record<string, number> = {};
  const keywords: Record<string, number> = {};

  for (const h of headlines) {
    const ents = extractEntitiesFromText(h.title);
    for (const e of ents) entities[e] = (entities[e] ?? 0) + 1;

    const tokens = h.title.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [];
    for (const t of tokens) {
      if (STOPWORDS.has(t)) continue;
      keywords[t] = (keywords[t] ?? 0) + 1;
    }
  }

  const snapshot: TrendSnapshot = {
    updatedAt: new Date().toISOString(),
    headlines: headlines.slice(0, 100),
    entities,
    keywords,
  };

  await putTrends(env, snapshot);
  return snapshot;
}
