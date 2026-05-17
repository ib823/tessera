#!/usr/bin/env node
/**
 * Run Stages 2 (Gemini bias audit) + 3 (Codex/ChatGPT fact-check) for one issue.
 *
 * Reads the canonical browser prompts that scripts/generate-stage-prompts.mjs
 * has already produced, invokes both CLIs in parallel, parses each tool's
 * wrapper output to extract the raw model JSON, validates, and writes to:
 *   engine/output/{slug}-stage2.json
 *   engine/output/{slug}-stage3.json
 *
 * This replaces the manual browser-paste workflow for these two stages.
 * Stage 6 synthesis (Claude) still runs after this script completes.
 *
 * Usage:
 *   node scripts/run-external-stages.mjs <slug>           # both stages
 *   node scripts/run-external-stages.mjs <slug> stage2    # only Gemini
 *   node scripts/run-external-stages.mjs <slug> stage3    # only Codex
 *
 * Requires: gemini CLI (>=0.42) and codex CLI (>=0.130) on PATH.
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
const onlyStage = process.argv[3];

if (!slug) {
  console.error('Usage: node scripts/run-external-stages.mjs <slug> [stage2|stage3]');
  process.exit(1);
}

const prompts = {
  stage2: join(root, 'engine', 'prompts-generated', `${slug}-stage2-browser.txt`),
  stage3: join(root, 'engine', 'prompts-generated', `${slug}-stage3-browser.txt`),
};
for (const [stage, path] of Object.entries(prompts)) {
  if (onlyStage && stage !== onlyStage) continue;
  if (!existsSync(path)) {
    console.error(`Missing prompt: ${path}`);
    console.error(`Generate first: node scripts/generate-stage-prompts.mjs ${slug}`);
    process.exit(1);
  }
}

const outputs = {
  stage2: join(root, 'engine', 'output', `${slug}-stage2.json`),
  stage3: join(root, 'engine', 'output', `${slug}-stage3.json`),
};

/** Strip ```json fences or ``` fences if the model wrapped its JSON. */
function stripFences(s) {
  let t = s.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/, '');
    t = t.replace(/\s*```\s*$/, '');
  }
  return t.trim();
}

function parseJsonOrThrow(s, label) {
  const stripped = stripFences(s);
  try {
    return JSON.parse(stripped);
  } catch (e) {
    const head = stripped.slice(0, 400);
    throw new Error(`${label}: JSON parse failed — ${e.message}\nFirst 400 chars: ${head}`);
  }
}

/** Run a child process, return { stdout, stderr, code, ms }. */
function run({ cmd, args, stdin, label, env }) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => { stdout += d.toString(); });
    p.stderr.on('data', (d) => { stderr += d.toString(); });
    p.on('close', (code) => resolve({ stdout, stderr, code, ms: Date.now() - start }));
    p.on('error', reject);
    if (stdin) p.stdin.write(stdin);
    p.stdin.end();
  });
}

async function runStage2() {
  const prompt = readFileSync(prompts.stage2, 'utf8');
  console.log(`  [stage2] Gemini bias audit — starting...`);
  const { stdout, stderr, code, ms } = await run({
    cmd: 'gemini',
    args: ['-p', '', '--yolo', '-o', 'json'],
    stdin: prompt,
    label: 'gemini',
  });
  if (code !== 0) {
    console.error(`  [stage2] gemini exit ${code}\n${stderr.slice(-500)}`);
    throw new Error(`gemini exit ${code}`);
  }
  // Gemini wraps the model output in { response: "...", session_id, stats }
  const wrapper = parseJsonOrThrow(stdout, 'gemini wrapper');
  if (typeof wrapper.response !== 'string') {
    throw new Error('gemini wrapper missing .response string');
  }
  const stage2 = parseJsonOrThrow(wrapper.response, 'stage2 model output');
  writeFileSync(outputs.stage2, JSON.stringify(stage2, null, 2) + '\n');
  console.log(`  [stage2] ✓ saved ${outputs.stage2}  (${(ms / 1000).toFixed(1)}s, bias_score=${stage2.bias_score ?? '?'})`);
  return stage2;
}

async function runStage3() {
  const prompt = readFileSync(prompts.stage3, 'utf8');
  console.log(`  [stage3] Codex fact-check — starting...`);
  const { stdout, stderr, code, ms } = await run({
    cmd: 'codex',
    args: ['exec', '--json', '--skip-git-repo-check', '--ignore-user-config', '-'],
    stdin: prompt,
    label: 'codex',
  });
  if (code !== 0) {
    console.error(`  [stage3] codex exit ${code}\n${stderr.slice(-500)}`);
    throw new Error(`codex exit ${code}`);
  }
  // Codex emits NDJSON; the final agent message is in item.completed with type=agent_message
  let agentText = null;
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    try {
      const evt = JSON.parse(line);
      if (evt.type === 'item.completed' && evt.item?.type === 'agent_message') {
        agentText = evt.item.text;
      }
    } catch (_) { /* skip non-JSON lines */ }
  }
  if (!agentText) {
    throw new Error('codex: no agent_message in stream');
  }
  const stage3 = parseJsonOrThrow(agentText, 'stage3 model output');
  writeFileSync(outputs.stage3, JSON.stringify(stage3, null, 2) + '\n');
  console.log(`  [stage3] ✓ saved ${outputs.stage3}  (${(ms / 1000).toFixed(1)}s, FAS=${stage3.factual_accuracy_score ?? '?'})`);
  return stage3;
}

(async () => {
  console.log(`Running external stages for: ${slug}`);
  const tasks = [];
  if (!onlyStage || onlyStage === 'stage2') tasks.push(runStage2());
  if (!onlyStage || onlyStage === 'stage3') tasks.push(runStage3());
  const start = Date.now();
  const results = await Promise.allSettled(tasks);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  let failed = 0;
  for (const r of results) {
    if (r.status === 'rejected') {
      console.error(`  ✗ ${r.reason?.message ?? r.reason}`);
      failed++;
    }
  }
  console.log(`Done in ${elapsed}s (${failed} failed)`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(2);
});
