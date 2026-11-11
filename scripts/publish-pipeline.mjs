#!/usr/bin/env node
/**
 * T4A Publishing Pipeline Orchestrator.
 *
 * Thin state-machine over existing scripts. A Claude session (or a human)
 * walks through phases 0→9 by calling subcommands below. State lives in
 * `engine/output/{slug}-pipeline-state.json` so any future session can pick
 * up mid-pipeline by inspecting it.
 *
 * Subcommands:
 *   init <slug>              Phase 0  — create state file, reserve next ID
 *   status <slug>            show phase table + next action
 *   set-phase <slug> <phase> <json>   mark a phase complete with metadata
 *   stage-prompts <slug>     Phase 3  — generate Stage 2/3 browser prompts
 *   collect <slug> <stage> <json-path>    Phase 4  — record pasted response
 *   sherlock <id>            Phase 7a — propose related[] from fact-graph
 *   image-prompt <id>        Phase 7b — print the T4A image prompt for ID
 *   validate                 Phase 8  — issue/source validation + stealth check
 *   deploy <id> [--dry-run]   Phase 9  — validate bundle + commit + rebase + push
 *
 * This script never invokes LLMs itself. Stages 2 and 3 stay in the browser
 * (paste into Gemini + ChatGPT). Stages 4 and 5 (DeepSeek, Grok) are retired
 * from the pipeline. Image rendering stays manual.
 */

import {
  existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, openSync, closeSync, unlinkSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ISSUES_DIR = join(ROOT, 'src', 'data', 'issues');
const BRIEFS_DIR = join(ROOT, 'engine', 'briefs');
const OUTPUT_DIR = join(ROOT, 'engine', 'output');
const PROMPTS_DIR = join(ROOT, 'engine', 'prompts-generated');
const OG_BG_DIR  = join(ROOT, 'public', 'og', 'backgrounds');

// Canonical phase order. `status` walks this list and reports the first
// not-yet-done phase as the next action.
const PHASES = [
  '0_init',
  '1_research',
  '2_stage1',
  '3_browser_prompts',
  '4_stage2_collected',
  '4_stage3_collected',
  '5_synthesis',
  '6_legal_check',
  '7a_sherlock',
  '7b_image_prompt',
  '7b_image_uploaded',
  '8_validated',
  '9_deployed',
];

const NEXT_ACTION_HINTS = {
  '0_init':              'run: init <slug>',
  '1_research':          'Claude writes engine/briefs/{slug}.md (primary sources, 12-dim audit)',
  '2_stage1':            'Claude writes engine/output/{slug}-stage1.json (7-card analysis + PA score)',
  '3_browser_prompts':   'run: stage-prompts <slug>, then paste stage2 into Gemini and stage3 into ChatGPT',
  '4_stage2_collected':  'run: collect <slug> stage2 <path-to-pasted-gemini-response.json>',
  '4_stage3_collected':  'run: collect <slug> stage3 <path-to-pasted-chatgpt-response.json>',
  '5_synthesis':         'Claude writes engine/output/{slug}-stage6-synthesis.json (applies BA + FC + self-verify → SR)',
  '6_legal_check':       'Claude runs the 11-point legal + accuracy check + writes engine/output/{slug}-reader.json',
  '7a_sherlock':         'run: sherlock <id> — propose related[] + bidirectional updates',
  '7b_image_prompt':     'run: image-prompt <id> — operator renders the image in-browser',
  '7b_image_uploaded':   'operator drops rendered art at public/og/backgrounds/issue-{id}-bg.png',
  '8_validated':         'run: validate',
  '9_deployed':          'run: deploy <id>',
};


// ── state file helpers ────────────────────────────────────────────────────


function statePath(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) {
    throw new Error('slug must contain lowercase words separated by single hyphens');
  }
  return join(OUTPUT_DIR, `${slug}-pipeline-state.json`);
}

function loadState(slug) {
  const p = statePath(slug);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

function saveState(slug, state) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(statePath(slug), JSON.stringify(state, null, 2) + '\n');
}

function markPhase(slug, phase, meta = {}) {
  if (!PHASES.includes(phase)) {
    throw new Error(`unknown phase: ${phase}. Valid: ${PHASES.join(', ')}`);
  }
  const state = loadState(slug);
  if (!state) throw new Error(`no state for slug ${slug} — run init first`);
  state.phases[phase] = {
    done: true,
    at: new Date().toISOString(),
    ...meta,
  };
  saveState(slug, state);
  return state;
}

function nextPhase(state) {
  for (const p of PHASES) {
    if (!state.phases[p]?.done) return p;
  }
  return null;
}


// ── helpers ────────────────────────────────────────────────────────────────


function pipelineStates() {
  if (!existsSync(OUTPUT_DIR)) return [];
  return readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith('-pipeline-state.json'))
    .map((file) => ({ file, state: JSON.parse(readFileSync(join(OUTPUT_DIR, file), 'utf8')) }));
}

function assertIssueId(id) {
  if (!/^\d{4}$/.test(id || '')) throw new Error('issue ID must be a four-digit string');
}

function nextIssueId() {
  const ids = (existsSync(ISSUES_DIR) ? readdirSync(ISSUES_DIR) : [])
    .filter((f) => /^\d{4}\.json$/.test(f))
    .map((f) => Number(f.slice(0, 4)));
  for (const { state } of pipelineStates()) {
    assertIssueId(state.issue_id);
    ids.push(Number(state.issue_id));
  }
  const max = ids.length ? Math.max(...ids) : 0;
  if (max >= 9999) throw new Error('no four-digit issue IDs remain');
  return String(max + 1).padStart(4, '0');
}

function runScript(cmd, args = []) {
  const r = spawnSync('node', [join(ROOT, 'scripts', cmd), ...args], {
    stdio: 'inherit', cwd: ROOT,
  });
  if (r.status !== 0) {
    throw new Error(`${cmd} exited with ${r.status}`);
  }
}

function fail(msg) {
  console.error(`\nERROR: ${msg}`);
  process.exit(1);
}


// ── subcommands ────────────────────────────────────────────────────────────


function cmdInit(slug, issueIdOverride) {
  if (!slug) fail('usage: init <slug> [issueId]');
  statePath(slug); // Validate before making directories or writing any files.
  if (issueIdOverride) assertIssueId(issueIdOverride);

  mkdirSync(BRIEFS_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(PROMPTS_DIR, { recursive: true });
  mkdirSync(OG_BG_DIR,  { recursive: true });

  if (existsSync(statePath(slug))) {
    console.log(`State file already exists for "${slug}":`);
    console.log(`  ${statePath(slug)}`);
    console.log('To restart, delete it first. Otherwise use `status ${slug}`.');
    return;
  }

  // Separate slugs must not reserve the same ID when init runs concurrently.
  const lockPath = join(OUTPUT_DIR, '.issue-id.lock');
  let lock;
  try {
    lock = openSync(lockPath, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('another init holds the issue-ID lock; retry after it finishes');
    throw error;
  }
  try {
    // Recheck after acquiring the lock: another process may have created it.
    if (existsSync(statePath(slug))) throw new Error(`state already exists for ${slug}; use status`);
    const issueId = issueIdOverride || nextIssueId();
    const reserved = pipelineStates().find(({ state }) =>
      state.issue_id === issueId && !state.phases?.['9_deployed']?.done);
    if (reserved) throw new Error(`issue ${issueId} is reserved by ${reserved.state.slug}`);
    const state = {
      slug,
      issue_id: issueId,
      created_at: new Date().toISOString(),
      paths: {
        brief:           `engine/briefs/${slug}.md`,
        stage1:          `engine/output/${slug}-stage1.json`,
        stage2:          `engine/output/${slug}-stage2.json`,
        stage3:          `engine/output/${slug}-stage3.json`,
        stage6:          `engine/output/${slug}-stage6-synthesis.json`,
        reader:          `engine/output/${slug}-reader.json`,
        issue:           `src/data/issues/${issueId}.json`,
        og_background:   `public/og/backgrounds/issue-${issueId}-bg.png`,
      },
      phases: Object.fromEntries(PHASES.map((p) => [p, { done: false }])),
    };
    state.phases['0_init'] = { done: true, at: new Date().toISOString() };
    saveState(slug, state);

    console.log(`Initialised pipeline for "${slug}" (issue ${issueId}).`);
    console.log(`State: ${statePath(slug).replace(ROOT + '/', '')}`);
    console.log(`Next:  ${NEXT_ACTION_HINTS['1_research']}`);
  } finally {
    closeSync(lock);
    unlinkSync(lockPath);
  }
}


function cmdStatus(slug) {
  if (!slug) fail('usage: status <slug>');
  const state = loadState(slug);
  if (!state) fail(`no state file for "${slug}". Run: init ${slug}`);

  console.log(`\nPipeline state for ${slug} (issue ${state.issue_id})`);
  console.log(`Created: ${state.created_at}`);
  console.log('');
  for (const p of PHASES) {
    const ph = state.phases[p] || { done: false };
    const marker = ph.done ? '✓' : '·';
    const at = ph.done ? ` (${ph.at})` : '';
    console.log(`  ${marker} ${p}${at}`);
  }
  const next = nextPhase(state);
  console.log('');
  if (next) {
    const hint = NEXT_ACTION_HINTS[next] || next;
    console.log(`Next phase: ${next}`);
    console.log(`Action:     ${hint.replaceAll('{slug}', slug).replaceAll('{id}', state.issue_id)}`);
  } else {
    console.log('Pipeline complete.');
  }
  console.log('');
}


function cmdSetPhase(slug, phase, metaJson) {
  if (!slug || !phase) fail('usage: set-phase <slug> <phase> [json-meta]');
  const meta = metaJson ? JSON.parse(metaJson) : {};
  const state = markPhase(slug, phase, meta);
  console.log(`Marked ${phase} done for ${slug}. Next: ${nextPhase(state) || '(pipeline complete)'}`);
}


function cmdStagePrompts(slug) {
  if (!slug) fail('usage: stage-prompts <slug>');
  const state = loadState(slug);
  if (!state) fail(`no state for ${slug}`);

  const stage1 = join(ROOT, state.paths.stage1);
  if (!existsSync(stage1)) {
    fail(`Stage 1 output missing: ${state.paths.stage1}\n`
       + `Write it first (Phase 2), then re-run stage-prompts.`);
  }

  // Delegates to the existing generator which writes stage2-5 browser prompts.
  // We still generate all 4 files (cheap) but the playbook instructs operator
  // to only use stage2-browser.txt (Gemini) and stage3-browser.txt (ChatGPT).
  runScript('generate-stage-prompts.mjs', [slug]);

  const stage2prompt = join(PROMPTS_DIR, `${slug}-stage2-browser.txt`);
  const stage3prompt = join(PROMPTS_DIR, `${slug}-stage3-browser.txt`);
  const have = [stage2prompt, stage3prompt].filter(existsSync);
  if (have.length < 2) {
    fail(`generator ran but expected prompt files missing under ${PROMPTS_DIR}`);
  }

  markPhase(slug, '3_browser_prompts', {
    prompts: {
      stage2: state.paths.stage1.replace('-stage1.json', '-stage2-browser.txt')
                                 .replace('engine/output/', 'engine/prompts-generated/'),
      stage3: state.paths.stage1.replace('-stage1.json', '-stage3-browser.txt')
                                 .replace('engine/output/', 'engine/prompts-generated/'),
    },
  });

  console.log('');
  console.log('Next:');
  console.log(`  1. Paste ${have[0].replace(ROOT + '/', '')} into Gemini.`);
  console.log(`     Save JSON response to ${state.paths.stage2}`);
  console.log(`     Then: collect ${slug} stage2 ${state.paths.stage2}`);
  console.log(`  2. Paste ${have[1].replace(ROOT + '/', '')} into ChatGPT.`);
  console.log(`     Save JSON response to ${state.paths.stage3}`);
  console.log(`     Then: collect ${slug} stage3 ${state.paths.stage3}`);
}


function cmdCollect(slug, stage, responsePath) {
  if (!slug || !stage || !responsePath) {
    fail('usage: collect <slug> <stage2|stage3|stage4|stage5> <path-to-json>');
  }
  const validStages = ['stage2', 'stage3', 'stage4', 'stage5'];
  if (!validStages.includes(stage)) {
    fail(`stage must be one of ${validStages.join('|')} (got "${stage}").`);
  }
  const state = loadState(slug);
  if (!state) fail(`no state for ${slug}`);

  const abs = responsePath.startsWith('/') ? responsePath : join(ROOT, responsePath);
  if (!existsSync(abs)) fail(`response file not found: ${abs}`);

  // Sanity-check: must be valid JSON.
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    fail(`${abs} is not valid JSON: ${e.message}`);
  }

  // Extract the score the editorial brand tracks per stage.
  const scoreKeys = {
    stage2: 'bias_score',
    stage3: 'factual_accuracy_score',
    stage4: 'completeness_score',
    stage5: 'courage_score',
  };
  const scoreKey = scoreKeys[stage];
  const score = parsed?.[scoreKey];
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error(`${stage} response must contain a numeric ${scoreKey} between 0 and 100`);
  }

  // Fill in paths for stage4/5 if not already reserved in state.
  if (!state.paths[stage]) {
    state.paths[stage] = `engine/output/${slug}-${stage}.json`;
    saveState(slug, state);
  }

  // Normalise to canonical path regardless of where the user wrote it.
  const canonical = join(ROOT, state.paths[stage]);
  if (abs !== canonical) {
    mkdirSync(dirname(canonical), { recursive: true });
    writeFileSync(canonical, JSON.stringify(parsed, null, 2) + '\n');
    console.log(`Copied response to canonical path: ${state.paths[stage]}`);
  }

  // Stages 2 and 3 have formal phase entries in the state machine.
  // Stages 4 and 5 are tracked as optional metadata under `legacy_stages`
  // so they can be re-engaged for a specific issue without changing the
  // default 4-stage phase model.
  if (stage === 'stage2' || stage === 'stage3') {
    markPhase(slug, `4_${stage}_collected`, {
      path: state.paths[stage],
      [scoreKey]: score ?? null,
    });
  } else {
    const s = loadState(slug);
    s.legacy_stages = s.legacy_stages || {};
    s.legacy_stages[stage] = {
      collected_at: new Date().toISOString(),
      path: state.paths[stage],
      [scoreKey]: score ?? null,
    };
    saveState(slug, s);
  }

  console.log(`Recorded ${stage} response. ${scoreKey}=${score ?? 'n/a'}`);
  const next = nextPhase(loadState(slug));
  if (next) console.log(`Next phase: ${next} — ${NEXT_ACTION_HINTS[next]?.replaceAll('{slug}', slug)}`);
}


function cmdSherlock(id) {
  if (!id) fail('usage: sherlock <issue-id>');

  // Build (or refresh) the fact-graph first — it must reflect the new issue.
  runScript('build-fact-graph.mjs');

  const graphPath = join(ROOT, 'public', 'fact-graph.json');
  if (!existsSync(graphPath)) {
    fail('fact-graph.json missing after build');
  }
  const graph = JSON.parse(readFileSync(graphPath, 'utf8'));
  const conns = graph.connections?.[id] ?? [];

  if (!conns.length) {
    console.log(`No connections found for issue ${id}.`);
    console.log('If you just drafted the issue JSON, ensure it has been saved');
    console.log('to src/data/issues/ before running sherlock.');
    return;
  }

  console.log(`\nSherlock — connections for issue ${id}:`);
  for (const c of conns.slice(0, 10)) {
    console.log(`  → ${c.id}  weight=${c.weight}  shared=${c.sharedEntities.join(', ')}`);
  }
  console.log('\nNext: edit the new issue\'s `related[]` to include these IDs');
  console.log('      and add the reverse link in each connected issue\'s JSON.');
}


function cmdImagePrompt(id) {
  if (!id) fail('usage: image-prompt <issue-id>');

  const issuePath = join(ISSUES_DIR, `${id}.json`);
  if (!existsSync(issuePath)) {
    fail(`issue file not found: src/data/issues/${id}.json`);
  }
  const issue = JSON.parse(readFileSync(issuePath, 'utf8'));

  // Canonical T4A image template, verbatim from CLAUDE.md (PHASE 7: SHERLOCK
  // + IMAGE, "Image Prompt"). Only the header, the subject placeholder and the
  // save path vary per issue; the editor fills the placeholder by hand using
  // the subject rules listed under the template in CLAUDE.md. Change this text
  // only together with CLAUDE.md.
  const TEMPLATE = [
    `=== ISSUE ${id}: ${issue.headline} ===`,
    '',
    'Create a minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. Use one single unbroken bold white line (#FFFFFF) with perfectly consistent stroke weight throughout. The entire drawing must be created as one continuous gesture without the pen ever lifting from the canvas.',
    '',
    'Draw [INSERT YOUR SUBJECT DESCRIPTION HERE] as one clean, elegant, and confident single continuous line. The line quality should be bold, smooth, and editorial.',
    '',
    'At the bottom right corner, seamlessly continue the exact same continuous line into a natural hand-drawn cursive "T4A" signature as the ending tail of the stroke. The T4A signature must feel like an organic part of the single unbroken line, not added separately.',
    '',
    'Style: elegant minimalist single-line illustration, contemplative, editorial. No fill, no shading, no extra lines, and no unnecessary details. Keep the composition clean with generous negative space, especially toward the right side of the frame.',
    '',
    'Aspect ratio 1.91:1 wide landscape. Ensure the final result matches the clean, consistent quality of previous T4A single continuous line images.',
    '',
    `Save as: public/og/backgrounds/issue-${id}-bg.png`,
  ];

  console.log('');
  console.log(TEMPLATE.join('\n'));
  console.log('');
  console.log('Fill the subject using the rules under "Image Prompt" in CLAUDE.md.');
  console.log('Then: set-phase <slug> 7b_image_uploaded');
}


function cmdValidate() {
  // validate-issues.mjs is the single source of truth for structural checks.
  // It iterates every issue under src/data/issues and exits non-zero on any
  // error — the pipeline script just wraps it so operators have one command.
  runScript('validate-issues.mjs');
  runScript('build-issue-sources.mjs', ['--check']);

  // Stealth check — provider-specific terms only. Bare words "AI" and
  // "model" are legitimate English (business model, AIDS, AIS) and generate
  // too many false positives. The post-build scripts/stealth.mjs separately
  // scrubs framework fingerprints from the shipped bundle.
  const banned = [
    'GPT', 'Claude', 'DeepSeek', 'Gemini', 'Grok', 'LLM',
    'language model', 'Anthropic', 'OpenAI', 'ChatGPT',
  ];
  const issuesFiles = readdirSync(ISSUES_DIR).filter((f) => f.endsWith('.json'));
  let hits = 0;
  for (const f of issuesFiles) {
    const txt = readFileSync(join(ISSUES_DIR, f), 'utf8');
    // Only scan visible editorial fields to avoid false positives on metadata.
    const obj = JSON.parse(txt);
    const fields = [obj.headline, obj.context];
    for (const card of (obj.cards || [])) {
      fields.push(card.big, card.sub);
    }
    const scan = fields.filter(Boolean).join('\n');
    for (const term of banned) {
      // Word-boundary match to avoid "AI" matching "aid" etc.
      const re = new RegExp(`\\b${term}\\b`, 'i');
      if (re.test(scan)) {
        console.error(`STEALTH: ${f} contains banned term "${term}"`);
        hits++;
      }
    }
  }
  if (hits) {
    fail(`stealth check found ${hits} banned-term violations`);
  }

  console.log('\nValidation + stealth check: PASS');
}


function git(args, capture = false) {
  // No shell interpolation: headlines, filenames and commit messages are data.
  const result = spawnSync('git', ['--literal-pathspecs', ...args], {
    cwd: ROOT, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`git ${args[0]} failed${capture ? `: ${result.stderr.trim()}` : ''}`);
  return result.stdout || '';
}

function publicationBundle(id, issue) {
  const matches = pipelineStates().filter(({ state }) => state.issue_id === id);
  const active = matches.filter(({ state }) => !state.phases?.['9_deployed']?.done);
  if (active.length > 1) throw new Error(`multiple active pipelines reserve issue ${id}; reconcile them before deploying`);
  const selected = active[0] || matches.sort((a, b) =>
    (b.state.created_at || '').localeCompare(a.state.created_at || ''))[0];
  if (!selected) throw new Error(`no pipeline evidence for issue ${id}; run init <slug> ${id} first`);
  const { state, file } = selected;
  statePath(state.slug);
  const files = new Set([`src/data/issues/${id}.json`, `engine/output/${file}`]);
  const required = {
    brief: `engine/briefs/${state.slug}.md`,
    stage1: `engine/output/${state.slug}-stage1.json`,
    stage2: `engine/output/${state.slug}-stage2.json`,
    stage3: `engine/output/${state.slug}-stage3.json`,
    stage6: `engine/output/${state.slug}-stage6-synthesis.json`,
    reader: `engine/output/${state.slug}-reader.json`,
  };
  for (const [key, canonical] of Object.entries(required)) {
    const path = state.paths?.[key] || canonical;
    if (path !== canonical) throw new Error(`unexpected ${key} path in ${file}: ${path}; expected ${canonical}`);
    if (!existsSync(join(ROOT, path))) throw new Error(`publication evidence missing: ${path}`);
    if (path.endsWith('.json')) JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
    files.add(path);
  }
  // Include optional escalation/legacy reviews and every generated stage prompt,
  // without adding another topic's artifacts or generated image variants.
  for (const suffix of ['stage4.json', 'stage5.json']) {
    const path = `engine/output/${state.slug}-${suffix}`;
    if (existsSync(join(ROOT, path))) files.add(path);
  }
  for (const stage of [2, 3, 4, 5]) {
    const path = `engine/prompts-generated/${state.slug}-stage${stage}-browser.txt`;
    if (existsSync(join(ROOT, path))) files.add(path);
    else if (stage <= 3) throw new Error(`publication prompt missing: ${path}`);
  }
  const sourcePath = `src/data/sources/${id}.json`;
  if (existsSync(join(ROOT, sourcePath))) files.add(sourcePath);
  const backgrounds = ['png', 'jpg'].map((ext) => `public/og/backgrounds/issue-${id}-bg.${ext}`)
    .filter((path) => existsSync(join(ROOT, path)));
  if (!backgrounds.length) throw new Error(`background image missing for issue ${id}`);
  for (const path of backgrounds) files.add(path);
  for (const related of issue.related || []) {
    assertIssueId(related);
    const path = `src/data/issues/${related}.json`;
    if (!existsSync(join(ROOT, path))) throw new Error(`related issue missing: ${path}`);
    files.add(path);
  }
  return [...files];
}

function cmdDeploy(id, option) {
  if (!id) fail('usage: deploy <issue-id> [--dry-run]');
  if (option && option !== '--dry-run') throw new Error(`unknown deploy option: ${option}`);
  assertIssueId(id);
  if (git(['branch', '--show-current'], true).trim() !== 'main') {
    throw new Error('deploy publishes main; switch to main before running it');
  }
  const issuePath = `src/data/issues/${id}.json`;
  if (!existsSync(join(ROOT, issuePath))) throw new Error(`issue file missing: ${issuePath}`);
  const issue = JSON.parse(readFileSync(join(ROOT, issuePath), 'utf8'));
  if (issue.id !== id || issue.published !== true) throw new Error(`issue ${id} must have the matching id and published: true`);
  const toStage = publicationBundle(id, issue);
  const changed = [
    ...git(['diff', '--name-only', '-z'], true).split('\0'),
    ...git(['diff', '--cached', '--name-only', '-z'], true).split('\0'),
  ].filter(Boolean);
  const unrelated = [...new Set(changed)].filter((path) => !toStage.includes(path));
  if (unrelated.length) {
    throw new Error(`unrelated tracked changes prevent a clean rebase; commit or set them aside first:\n${unrelated.join('\n')}`);
  }

  // Validate the exact publication before changing Git's index or history.
  cmdValidate();
  if (option === '--dry-run') {
    console.log(`\nValidated publication bundle for issue ${id}:\n${toStage.join('\n')}`);
    console.log('\nDry run complete. Git index, history and remotes were not changed.');
    return;
  }
  const commitMsg = `Publish: issue ${id} — ${(issue.headline || '').slice(0, 50)}`;
  git(['add', '--', ...toStage]);
  if (git(['diff', '--cached', '--name-only'], true).trim()) {
    git(['commit', '-m', commitMsg, '--only', '--', ...toStage]);
  }
  // Commit first so ordinary issue/related edits do not make rebase fail.
  // A conflict leaves the commit local and never pushes partial resolution.
  git(['pull', '--rebase', 'origin', 'main']);
  const rebasedIssue = JSON.parse(readFileSync(join(ROOT, issuePath), 'utf8'));
  if (rebasedIssue.id !== id || rebasedIssue.published !== true) {
    throw new Error(`issue ${id} is no longer a published candidate after rebase`);
  }
  // Reservations from another checkout may have arrived with the rebase.
  publicationBundle(id, rebasedIssue);
  cmdValidate();
  git(['push', 'origin', 'main']);

  console.log('\nPushed. GitHub Actions will build + deploy.');
  console.log(`Live URL: https://thefourthangle.pages.dev/issue/${id}`);
  console.log('Push notification fires on next CRON schedule (Tue/Thu 8am, Sat 9am MYT).');
}


// ── router ─────────────────────────────────────────────────────────────────


function usage() {
  console.log(`Usage: node scripts/publish-pipeline.mjs <command> [args]

Commands:
  init <slug> [issue-id]          Phase 0 — create state + next ID
  status <slug>                    show phase table + next action
  set-phase <slug> <phase> [json]  manually mark a phase complete
  stage-prompts <slug>             Phase 3 — generate Stage 2/3 browser prompts
  collect <slug> <stage> <path>    Phase 4 — record Gemini / ChatGPT response
  sherlock <issue-id>              Phase 7a — propose related[]
  image-prompt <issue-id>          Phase 7b — emit the T4A image prompt
  validate                         Phase 8 — issue/source validation + stealth grep
  deploy <issue-id> [--dry-run]    Phase 9 — validate bundle + commit + rebase + push

Phases: ${PHASES.join(' → ')}
`);
}

const [, , command, ...args] = process.argv;

try {
  switch (command) {
    case 'init':          cmdInit(...args); break;
    case 'status':        cmdStatus(...args); break;
    case 'set-phase':     cmdSetPhase(...args); break;
    case 'stage-prompts': cmdStagePrompts(...args); break;
    case 'collect':       cmdCollect(...args); break;
    case 'sherlock':      cmdSherlock(...args); break;
    case 'image-prompt':  cmdImagePrompt(...args); break;
    case 'validate':      cmdValidate(...args); break;
    case 'deploy':        cmdDeploy(...args); break;
    case '-h': case '--help': case 'help': case undefined:
      usage(); break;
    default:
      console.error(`unknown command: ${command}`);
      usage();
      process.exit(1);
  }
} catch (e) {
  console.error(`\n${e.message}`);
  process.exit(1);
}
