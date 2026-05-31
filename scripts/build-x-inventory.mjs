#!/usr/bin/env node
/**
 * build-x-inventory.mjs — maintains the manual-X posting inventory.
 *
 * T4A posts to X by hand (the X API is metered). This keeps an always-current,
 * status-tracked list of ready-to-paste X threads — one per published issue —
 * so the operator can post any of them at any time and we know what's been
 * posted and what hasn't.
 *
 * Run by:
 *   - the 2-hourly radar scan (folds in fresh radar "what's hot" signals)
 *   - the deploy build (adds a thread the moment a new issue publishes)
 *
 * Idempotent + accumulating: POSTED status and postedAt are preserved across
 * runs. Threads are regenerated each run so edits to cards/overrides flow in.
 *
 * Outputs:
 *   social/x-inventory.json  — machine state (status tracking)
 *   social/x-inventory.md    — human dashboard (PENDING queue + POSTED log)
 *
 * No dependencies (plain fs) and no network — safe in any CI step.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ISSUES_DIR = join(ROOT, 'src', 'data', 'issues');
const SOCIAL_DIR = join(ROOT, 'social');
const RADAR_DIR = join(ROOT, 'radar', 'output');
const SITE = 'https://thefourthangle.pages.dev';

const STATE_PATH = join(SOCIAL_DIR, 'x-inventory.json');
const MD_PATH = join(SOCIAL_DIR, 'x-inventory.md');
const OVERRIDES_PATH = join(SOCIAL_DIR, 'x-overrides.json');

const TWEET_LIMIT = 280;
const SAFETY = 10;

function readJson(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}

function loadPublishedIssues() {
  return readdirSync(ISSUES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(join(ISSUES_DIR, f), null))
    .filter((i) => i && i.published === true);
}

function compose(big, sub) {
  if (!sub) return big;
  const combined = `${big} ${sub}`;
  return combined.length <= TWEET_LIMIT - SAFETY ? combined : big;
}

/** Build the ordered thread for one issue from its cards + any override. */
function buildThread(issue, override) {
  const cards = Array.isArray(issue.cards) ? issue.cards : [];
  const hook = cards.find((c) => c.t === 'hook');
  const view = cards.find((c) => c.t === 'view');
  const middle = cards.filter((c) => c.t !== 'hook' && c.t !== 'view');
  const link = `${SITE}/issue/${issue.id}`;
  const posts = [];
  let n = 1;

  const hookText = override?.hook || (hook ? compose(hook.big, hook.sub) : null);
  if (hookText) posts.push({ n: n++, t: 'hook', text: hookText, note: 'attach image, NO link' });

  for (const c of middle) posts.push({ n: n++, t: c.t, text: compose(c.big, c.sub) });

  const closerLine = override?.closer || (view ? view.big : null);
  if (closerLine) {
    const tail = `${closerLine}\n\n${link}`;
    posts.push({ n: n++, t: 'view', text: tail.length <= TWEET_LIMIT ? tail : `${closerLine}\n${link}`, note: 'ONLY post with the link' });
  } else {
    posts.push({ n: n++, t: 'link', text: link, note: 'link' });
  }
  return posts;
}

/** Best-effort radar "is this topic hot right now" signal. */
function buildRadarMatcher() {
  const sw = readJson(join(RADAR_DIR, 'silence-watch.json'), []);
  const picks = Array.isArray(sw) ? sw : (sw.picks || []);
  const titles = picks
    .slice(0, 15)
    .map((p) => (p.title || p.keyword || '').toLowerCase())
    .filter(Boolean);
  const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'kata', 'akan', 'yang', 'untuk', 'dalam', 'pada', 'ini', 'itu']);
  function tokens(s) {
    return new Set((s || '').toLowerCase().match(/[a-z0-9]{4,}/g)?.filter((w) => !STOP.has(w)) || []);
  }
  return function match(issue) {
    const itext = `${issue.headline} ${issue.context || ''} ${(issue.cards || []).map((c) => c.lens || '').join(' ')}`;
    const itok = tokens(itext);
    for (const title of titles) {
      const ttok = tokens(title);
      let shared = 0;
      for (const w of itok) if (ttok.has(w)) shared++;
      if (shared >= 2) return title.slice(0, 90);
    }
    return null;
  };
}

function main() {
  if (!existsSync(SOCIAL_DIR)) mkdirSync(SOCIAL_DIR, { recursive: true });
  const prev = readJson(STATE_PATH, { entries: [] });
  const prevById = new Map((prev.entries || []).map((e) => [e.id, e]));
  const overrides = readJson(OVERRIDES_PATH, {});
  const radarMatch = buildRadarMatcher();
  const nowIso = new Date().toISOString();

  const issues = loadPublishedIssues().sort((a, b) => String(b.id).localeCompare(String(a.id)));

  const entries = issues.map((issue) => {
    const prevE = prevById.get(issue.id) || {};
    const override = overrides[issue.id];
    const posts = buildThread(issue, override);
    const radarHot = radarMatch(issue);
    const status = prevE.status === 'POSTED' ? 'POSTED' : 'PENDING';
    return {
      id: issue.id,
      headline: issue.headline,
      status,
      postedAt: prevE.postedAt || null,
      postedPlatforms: prevE.postedPlatforms || [],
      createdAt: prevE.createdAt || nowIso,
      reactive: !!radarHot,
      radarSignal: radarHot || null,
      image: `${SITE}/og/backgrounds/issue-${issue.id}-bg.png`,
      link: `${SITE}/issue/${issue.id}`,
      posts,
      updatedAt: nowIso,
    };
  });

  // Order the PENDING queue: reactive (topic hot) first, then newest id.
  const pending = entries.filter((e) => e.status === 'PENDING')
    .sort((a, b) => (Number(b.reactive) - Number(a.reactive)) || String(b.id).localeCompare(String(a.id)));
  const posted = entries.filter((e) => e.status === 'POSTED')
    .sort((a, b) => String(b.postedAt || '').localeCompare(String(a.postedAt || '')));

  const state = { generatedAt: nowIso, pendingCount: pending.length, postedCount: posted.length, entries };
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  writeFileSync(MD_PATH, renderMd({ nowIso, pending, posted }));
  console.log(`x-inventory: ${pending.length} pending, ${posted.length} posted (${entries.length} published issues)`);
}

function renderThreadBlock(e) {
  const lines = [];
  lines.push(`### Issue ${e.id} — ${e.headline}`);
  lines.push('');
  if (e.reactive) lines.push(`> ⚡ **Reactive: topic is live in the radar** (${e.radarSignal}). Post now, don't wait for a slot.`);
  lines.push(`- **Status:** ${e.status}${e.postedAt ? ` (posted ${e.postedAt}${e.postedPlatforms.length ? ', ' + e.postedPlatforms.join('+') : ''})` : ''}`);
  lines.push(`- **Attach image:** ${e.image}`);
  lines.push(`- **Mark posted:** \`node scripts/mark-x-posted.mjs ${e.id}\``);
  lines.push('');
  for (const p of e.posts) {
    lines.push(`**${p.n}/${e.posts.length}** _(${p.t}${p.note ? ' — ' + p.note : ''})_ · ${p.text.length} chars`);
    lines.push('```');
    lines.push(p.text);
    lines.push('```');
  }
  lines.push('');
  return lines.join('\n');
}

function renderMd({ nowIso, pending, posted }) {
  const out = [];
  out.push('# X Posting Inventory (manual)');
  out.push('');
  out.push(`_Auto-maintained by \`scripts/build-x-inventory.mjs\` (radar scan + deploy). Last refresh: ${nowIso}._`);
  out.push('');
  out.push('Post by hand from a clean T4A-only browser (VPN on). Post 1 carries the image and **no** link; the final post carries the **only** link. Best windows MYT: 07:00-10:00, 12:30-14:00, 20:30-22:30. Reactive items override the schedule.');
  out.push('');
  out.push(`## ⏳ TO POST (${pending.length})`);
  out.push('');
  if (pending.length === 0) out.push('_Nothing pending — all published issues have been posted._');
  for (const e of pending) out.push(renderThreadBlock(e));
  out.push('---');
  out.push('');
  out.push(`## ✅ POSTED (${posted.length})`);
  out.push('');
  for (const e of posted) out.push(`- **${e.id}** — ${e.headline}  _(${e.postedAt || 'date n/a'}${e.postedPlatforms.length ? ', ' + e.postedPlatforms.join('+') : ''})_`);
  out.push('');
  return out.join('\n');
}

main();
