#!/usr/bin/env node
/**
 * Derive each published issue's publication dates from git history.
 *
 *   publishedAt  the first commit on main in which the issue existed with
 *                `published: true`
 *   modifiedAt   the last commit on main that changed its headline, context
 *                or cards, after first publication
 *
 * Usage:
 *   node scripts/derive-issue-history.mjs                 dry run: prints a table
 *   node scripts/derive-issue-history.mjs --write         writes both fields into
 *                                                         src/data/issues/{id}.json
 *   node scripts/derive-issue-history.mjs --timeline f.json
 *                                                         dumps every edition and
 *                                                         content change per issue
 *                                                         (input for changes[] review)
 *   --ids 1102,1128                                       limit to these issues
 *
 * Needs full history (`git fetch --unshallow` in a shallow clone).
 *
 * Rules (also documented in CLAUDE.md, "Issue format"):
 *
 * 1. History is main's live line: the first-parent chain, except that a merge
 *    of main *into* a branch (later fast-forwarded onto main) is followed
 *    through its second parent, which is where main already was. A change
 *    counts from the commit at which it reached main, so a merged branch's
 *    work dates from the merge. Issues lived in src/data/issues.ts until
 *    2026-04-18 (parsed here) and in src/data/issues/{id}.json after.
 * 2. Times are commit times, written as ISO 8601 with the Malaysia offset
 *    (+08:00), because that is the readers' calendar.
 * 3. The 2026-03-28 commit that set `published: true` on all 1000 seed issues
 *    was reverted 21 minutes later and is not a publication (IGNORED_PUBLISH).
 * 4. Corpus-wide passes do not count as modifications (CORPUS_PASSES): style
 *    passes (em-dash removal, length trims, language QA), each of which states
 *    in its commit message that no fact, number, date, name or claim changed,
 *    and the 2026-04-05 pass that added the new analogy card to old issues.
 * 5. Content changes made on the day of first publication (Malaysia time) are
 *    launch fixes, not updates: when the last counted change falls on the
 *    publication day, modifiedAt equals publishedAt.
 * 6. Existing values are overwritten with --write, so the output always
 *    matches history. Issues published after this script last ran get both
 *    fields by hand at publication time (CLAUDE.md, Phase 8), and a re-run
 *    reproduces them.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { loadIssues, getIssuesDir } from './lib/load-issues.mjs';
import { setIssueFields } from './lib/issue-fields.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
};
const timelinePath = argValue('--timeline');
const onlyIds = argValue('--ids')?.split(',').map((s) => s.trim());

/** Commits whose `published: true` was a mistake reverted within minutes. */
export const IGNORED_PUBLISH = [
  { sha: 'd2f0ca9c7', why: 'Set published:true on all 1000 seed issues; reverted by 0f69d1cb1 21 minutes later.' },
];

/**
 * Corpus-wide passes that do not count as modifications. Matched by commit
 * subject so rebased copies match too. Each style pass states in its commit
 * message that no fact, number, date, name or claim changed; the format pass
 * added the then-new analogy card to existing issues and changed nothing else.
 */
export const CORPUS_PASSES = [
  { subject: /^Standardize issue length with research-grounded bite-size budget/, why: 'Style: length trims to the bite-size budget (7 issues), facts preserved.' },
  { subject: /^Audit and rectify all 26 remaining bite-size hard violators/, why: 'Style: length trims to hard caps (26 issues), "preserving every fact, source, number".' },
  { subject: /^Language QA: drive 72 warnings to 4 documented overrides/, why: 'Style: language-standard rewording (47 issues).' },
  { subject: /^QA\/QC: certify all 100 published/, why: 'Style: length trims; "No numbers, names, dates, lenses, or claims changed".' },
  { subject: /^QA\/QC corpus cleanup/, why: 'Style: em-dash removal across all published issues; "No fact, number, date, name, citation, or quote changed".' },
  { subject: /^Trim length-budget hard-max overruns from 31-issue rebuild/, why: 'Style: length trims after the 31-issue rebuild, "tightening only".' },
  { subject: /^(Merge: )?Add analogy card type/, why: 'Format: added the new analogy card to existing issues; other cards unchanged.' },
];

// ── git helpers ─────────────────────────────────────────────────────────────

function git(argv, opts = {}) {
  return execFileSync('git', argv, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'], ...opts });
}

if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
  console.error('Shallow clone: run `git fetch --unshallow` first.');
  process.exit(1);
}

const blobCache = new Map();
function readBlob(sha) {
  if (!blobCache.has(sha)) blobCache.set(sha, git(['cat-file', 'blob', sha]));
  return blobCache.get(sha);
}

/** Parse the ISSUES array out of a pre-split src/data/issues.ts blob. */
const tsCache = new Map();
function parseIssuesTs(sha) {
  if (tsCache.has(sha)) return tsCache.get(sha);
  const text = readBlob(sha);
  const start = text.indexOf('export const ISSUES');
  let map = null;
  if (start !== -1) {
    const open = text.indexOf('[', text.indexOf('=', start));
    const close = text.indexOf('\n];', open);
    const list = vm.runInNewContext(`(${text.slice(open, close + 2)})`, {}, { timeout: 10000 });
    map = new Map(list.map((issue) => [issue.id, issue]));
  }
  tsCache.set(sha, map);
  return map;
}

/** Issue states at one commit: Map<id, issue>, or a lookup function. */
const stateCache = new Map();
function stateAt(commit) {
  if (stateCache.has(commit)) return stateCache.get(commit);
  let lookup;
  const listing = git(['ls-tree', commit, 'src/data/issues/']).trim();
  if (listing) {
    const blobs = new Map();
    for (const line of listing.split('\n')) {
      const [meta, path] = line.split('\t');
      const m = path.match(/(\d{4})\.json$/);
      if (m) blobs.set(m[1], meta.split(' ')[2]);
    }
    lookup = (id) => (blobs.has(id) ? JSON.parse(readBlob(blobs.get(id))) : null);
  } else {
    let sha = null;
    try {
      sha = git(['rev-parse', `${commit}:src/data/issues.ts`]).trim();
    } catch {
      /* no issue data at this commit */
    }
    const map = sha ? parseIssuesTs(sha) : null;
    lookup = (id) => map?.get(id) ?? null;
  }
  stateCache.set(commit, lookup);
  return lookup;
}

// ── date helpers ────────────────────────────────────────────────────────────

/** ISO 8601 in Malaysia time, e.g. 2026-04-08T18:08:24+08:00. */
export function toMyt(iso) {
  const t = new Date(iso).getTime() + 8 * 3600 * 1000;
  return `${new Date(t).toISOString().slice(0, 19)}+08:00`;
}
const mytDay = (iso) => toMyt(iso).slice(0, 10);

// ── content signature ───────────────────────────────────────────────────────

function contentSig(issue) {
  return JSON.stringify({
    headline: issue.headline,
    context: issue.context,
    cards: (issue.cards ?? []).map((c) => [c.t, c.big, c.sub ?? '', c.lens ?? '']),
  });
}

// ── main ────────────────────────────────────────────────────────────────────

const current = loadIssues().filter((i) => i.published === true && i.retired !== true);
const targets = onlyIds ? current.filter((i) => onlyIds.includes(i.id)) : current;

// ── the live line ───────────────────────────────────────────────────────────
// Walk back from HEAD along the line that was deployed. Normally that is the
// first parent. A merge that pulls main *into* a branch ("Merge
// remote-tracking branch 'origin/main' into claude/x", then fast-forwarded)
// has main as its second parent, so the walk follows that instead: those
// commits were already live, and the branch's work lands at the merge.
const MERGE_OF_MAIN = /^Merge (remote-tracking )?branch '(origin\/)?main'|^Merge origin\/main\b/;

const allCommits = new Map();
for (const line of git(['log', '--format=%H%x09%P%x09%cI%x09%s']).trim().split('\n')) {
  const [sha, parents, date, subject] = line.split('\t');
  allCommits.set(sha, { sha, parents: parents ? parents.split(' ') : [], date, subject });
}
const liveLine = [];
for (let sha = git(['rev-parse', 'HEAD']).trim(); sha; ) {
  const c = allCommits.get(sha);
  const parent = (MERGE_OF_MAIN.test(c.subject) && c.parents[1]) || c.parents[0] || null;
  liveLine.push({ ...c, parent });
  sha = parent;
}
liveLine.reverse();

// Keep the live-line commits whose issue data differs from their live parent.
// One cat-file call resolves the data tree and the pre-split issues.ts blob
// for every commit.
const objectIds = git(['cat-file', '--batch-check=%(objectname)'], {
  input: liveLine.flatMap((c) => [`${c.sha}:src/data/issues`, `${c.sha}:src/data/issues.ts`]).join('\n'),
  stdio: ['pipe', 'pipe', 'ignore'],
})
  .trim()
  .split('\n')
  // A missing path prints "<input> missing", which names the commit; normalise it.
  .map((line) => (line.endsWith(' missing') ? 'missing' : line));
const dataKey =new Map(liveLine.map((c, i) => [c.sha, `${objectIds[2 * i]} ${objectIds[2 * i + 1]}`]));
const commits = liveLine.filter((c) => !c.parent || dataKey.get(c.sha) !== dataKey.get(c.parent));

const isIgnoredPublish = (c) => IGNORED_PUBLISH.some((p) => c.sha.startsWith(p.sha));
const corpusPass = (c) => CORPUS_PASSES.find((p) => p.subject.test(c.subject)) ?? null;

const results = [];
const timeline = {};

for (const issue of targets) {
  const id = issue.id;
  const events = [];
  const publishRuns = [];
  let publishedAt = null;
  let firstEdition = null;
  let lastChange = null;

  for (const c of commits) {
    const now = stateAt(c.sha)(id);
    const before = c.parent ? stateAt(c.parent)(id) : null;
    const nowPublished = now?.published === true && !isIgnoredPublish(c);
    // A change in the commit that first publishes the issue is part of the publication.
    const wasPublished = publishedAt != null;
    if (!publishedAt && nowPublished) {
      publishedAt = c.date;
      firstEdition = now.edition;
    }
    const run = publishRuns.at(-1);
    if (nowPublished && (!run || run.to)) publishRuns.push({ from: toMyt(c.date), fromSubject: c.subject, to: null });
    if (!nowPublished && run && !run.to) Object.assign(run, { to: toMyt(c.date), toSubject: c.subject });

    if (now && before && contentSig(now) !== contentSig(before)) {
      const pass = corpusPass(c);
      events.push({
        sha: c.sha.slice(0, 9),
        date: toMyt(c.date),
        subject: c.subject,
        editionBefore: before.edition,
        editionAfter: now.edition,
        published: now.published === true,
        afterFirstPublication: wasPublished,
        corpusPass: pass ? pass.why : null,
        before: { headline: before.headline, context: before.context, cards: before.cards },
        after: { headline: now.headline, context: now.context, cards: now.cards },
      });
      if (wasPublished && !pass) lastChange = c.date;
    } else if (now && before && now.edition !== before.edition) {
      events.push({
        sha: c.sha.slice(0, 9), date: toMyt(c.date), subject: c.subject,
        editionBefore: before.edition, editionAfter: now.edition, published: now.published === true,
        afterFirstPublication: wasPublished, corpusPass: null, editionOnly: true,
      });
    }
  }

  if (!publishedAt) {
    results.push({ id, publishedAt: null, modifiedAt: null, note: 'never published on main' });
    continue;
  }
  let modifiedAt = publishedAt;
  if (lastChange && mytDay(lastChange) !== mytDay(publishedAt)) modifiedAt = lastChange;

  results.push({
    id,
    publishedAt: toMyt(publishedAt),
    modifiedAt: toMyt(modifiedAt),
    edition: issue.edition,
    firstEdition,
    changes: events.filter((e) => e.afterFirstPublication && !e.editionOnly && !e.corpusPass).length,
    passes: events.filter((e) => e.afterFirstPublication && e.corpusPass).length,
  });
  timeline[id] = {
    headline: issue.headline,
    edition: issue.edition,
    status: issue.status,
    publishedAt: toMyt(publishedAt),
    modifiedAt: toMyt(modifiedAt),
    firstEdition,
    publishRuns,
    events,
  };
}

// ── output ──────────────────────────────────────────────────────────────────

// ed = current edition, ed@pub = edition when first published,
// changes = counted content changes after publication, passes = corpus passes ignored.
console.log('id    publishedAt                modifiedAt                 ed  ed@pub  changes  passes');
for (const r of results) {
  if (!r.publishedAt) {
    console.log(`${r.id}  ${r.note}`);
    continue;
  }
  const pad = (v, n) => String(v).padStart(n);
  console.log(`${r.id}  ${r.publishedAt}  ${r.modifiedAt}  ${pad(r.edition, 2)}  ${pad(r.firstEdition, 6)}  ${pad(r.changes, 7)}  ${pad(r.passes, 6)}`);
}

if (timelinePath) {
  writeFileSync(timelinePath, `${JSON.stringify(timeline, null, 2)}\n`, 'utf8');
  console.log(`\nTimeline written: ${timelinePath}`);
}

if (WRITE) {
  const dir = getIssuesDir();
  let written = 0;
  for (const r of results) {
    if (!r.publishedAt) continue;
    const path = join(dir, `${r.id}.json`);
    const text = readFileSync(path, 'utf8');
    // Text edit, not re-serialisation: the diff shows only the two dates.
    const next = setIssueFields(text, { publishedAt: r.publishedAt, modifiedAt: r.modifiedAt });
    JSON.parse(next);
    if (next !== text) {
      writeFileSync(path, next, 'utf8');
      written += 1;
    }
  }
  console.log(`\nWrote publishedAt/modifiedAt to ${written} issue file(s).`);
}
