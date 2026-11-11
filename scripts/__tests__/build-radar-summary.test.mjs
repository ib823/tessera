import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { buildRadarSummary, main } from '../build-radar-summary.mjs';

const NOW = new Date('2026-11-12T04:00:00Z');
const SCAN = '2026-11-12T03:00:00Z';
const health = { last_scan: SCAN };
const row = (extra = {}) => ({ title: 'MACC investigates procurement', priority: 'high',
  controversy_score: 0.8, confidence: 0.6, timestamp: '2026-11-12T02:00:00Z', ...extra });
const strict = (queue, options = {}) => buildRadarSummary(queue,
  { health, requireFresh: true, now: NOW, ...options });

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'radar-summary-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, path, value) {
  const output = join(root, path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, typeof value === 'string' ? value : JSON.stringify(value));
}

test('summary preserves source scan time and existing selection/max-score behavior', () => {
  const summary = strict([
    row(), row({ title: 'MACC procurement audit', controversy_score: 0.9 }),
    row({ title: 'BNM interest rates', priority: 'medium', controversy_score: 0.5 }),
    row({ title: 'EPF retirement savings', confidence: 0.4 }),
  ]);
  assert.equal(summary.generatedAt, '2026-11-12T03:00:00.000Z');
  assert.equal(summary.selectedCount, 2);
  assert.equal(summary.entities['inst:MACC'], 0.9);
  assert.equal(summary.keywords.procurement, 0.9);
  assert.equal(summary.entities['inst:BNM'], undefined);
  assert.equal(summary.entities['inst:EPF'], undefined);
});

test('fresh scan may contain older evidence within the seven-day queue window', () => {
  const summary = strict([row({ timestamp: '2026-11-06T03:00:00Z',
    first_seen: '2026-05-01T00:00:00Z', peak_at: '2026-10-01T00:00:00Z' })]);
  assert.equal(summary.selectedCount, 1);
  assert.equal(summary.generatedAt, '2026-11-12T03:00:00.000Z');
});

test('freshness checks compare timezone offsets as instants', () => {
  assert.equal(strict([row({ timestamp: '2026-11-12T10:00:00+08:00' })],
    { health: { last_scan: '2026-11-12T11:00:00+08:00' } }).generatedAt,
  '2026-11-12T03:00:00.000Z');
});

test('strict mode rejects missing, invalid, future and stale scan health', () => {
  for (const last_scan of [undefined, null, '', 'invalid', '2026-11-12',
    '2026-11-12T03:00:00', '2026-02-30T03:00:00Z', '2026-11-12T24:00:00Z',
    '2026-11-12T04:00:01Z', '2026-11-11T23:59:59Z']) {
    assert.throws(() => strict([row()], { health: { last_scan } }), /health\.last_scan/,
      `accepted invalid/stale scan ${last_scan}`);
  }
  assert.throws(() => strict([row()], { health: null }), /health\.last_scan/);
  assert.doesNotThrow(() => strict([row({ timestamp: '2026-11-11T23:00:00Z' })],
    { health: { last_scan: '2026-11-12T00:00:00Z' } }));
});

test('strict mode rejects malformed queue and score fields before selection', () => {
  for (const queue of [null, {}, [null], [[]], [row({ title: '' })],
    [row({ priority: 'urgent' })], [row({ controversy_score: '0.8' })],
    [row({ controversy_score: NaN })], [row({ controversy_score: 1.1 })],
    [row({ confidence: -0.1 })], [row({ confidence: undefined })], [row(), row()]]) {
    assert.throws(() => strict(queue), /queue/);
  }
  // Even rows excluded from the resulting summary must have valid evidence.
  assert.throws(() => strict([row({ priority: 'low', timestamp: 'invalid' })]), /timestamp/);
});

test('strict mode rejects invalid, future or expired queue evidence', () => {
  for (const timestamp of [undefined, null, 'invalid', '2026-11-12T02:00:00',
    '2026-11-12T03:00:01Z', '2026-11-05T02:59:59Z']) {
    assert.throws(() => strict([row({ timestamp })]), /timestamp/);
  }
  assert.throws(() => strict([row({ last_evidence_at: '2026-11-12T03:01:00Z' })]), /last_evidence_at/);
  assert.throws(() => strict([row({ peak_at: 'invalid' })]), /peak_at/);
  assert.doesNotThrow(() => strict([row({ timestamp: '2026-11-05T03:00:00Z' })]));
});

test('fresh empty queue remains a valid summary with no boosts', () => {
  assert.deepEqual(strict([]), { generatedAt: '2026-11-12T03:00:00.000Z',
    selectedCount: 0, entities: {}, keywords: {} });
});

test('permissive website build keeps missing input behavior and source provenance', (t) => {
  const root = fixture(t);
  const missing = main({ rootDir: root, args: [], now: NOW });
  assert.equal(missing.selectedCount, 0);
  assert.equal(missing.generatedAt, NOW.toISOString());
  write(root, 'radar/output/issue-queue.json', [row()]);
  write(root, 'radar/output/health.json', { last_scan: '2026-11-01T00:00:00Z' });
  const stale = main({ rootDir: root, args: [], now: NOW });
  assert.equal(stale.selectedCount, 1);
  assert.equal(stale.generatedAt, '2026-11-01T00:00:00.000Z');
});

test('strict file loading refuses missing/malformed files and never writes failed output', (t) => {
  const root = fixture(t);
  const run = () => main({ rootDir: root, args: ['--require-fresh'], now: NOW });
  assert.throws(run, /issue queue is unreadable/);
  write(root, 'radar/output/issue-queue.json', [row()]);
  assert.throws(run, /scan health is unreadable/);
  write(root, 'radar/output/health.json', '{invalid JSON');
  assert.throws(run, /scan health is unreadable/);
  write(root, 'radar/output/health.json', health);
  write(root, 'radar/output/issue-queue.json', '{invalid JSON');
  assert.throws(run, /issue queue is unreadable/);
  assert.equal(existsSync(join(root, 'engine/private/radar-summary.json')), false);
  write(root, 'radar/output/issue-queue.json', [row()]);
  run();
  assert.equal(JSON.parse(readFileSync(join(root, 'engine/private/radar-summary.json'))).generatedAt,
    '2026-11-12T03:00:00.000Z');
});

test('CLI exits nonzero on stale scan and succeeds on fresh source data', (t) => {
  const root = fixture(t);
  mkdirSync(join(root, 'scripts/lib'), { recursive: true });
  copyFileSync(fileURLToPath(new URL('../build-radar-summary.mjs', import.meta.url)),
    join(root, 'scripts/build-radar-summary.mjs'));
  copyFileSync(fileURLToPath(new URL('../lib/entity-patterns.mjs', import.meta.url)),
    join(root, 'scripts/lib/entity-patterns.mjs'));
  const now = Date.now();
  const scan = new Date(now - 60_000).toISOString();
  write(root, 'radar/output/issue-queue.json', [row({ timestamp: scan })]);
  write(root, 'radar/output/health.json', { last_scan: new Date(now - 5 * 60 * 60 * 1000).toISOString() });
  const cli = () => spawnSync(process.execPath, ['scripts/build-radar-summary.mjs', '--require-fresh'],
    { cwd: root, encoding: 'utf8' });
  const rejected = cli();
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /older than four hours/);
  assert.equal(existsSync(join(root, 'engine/private/radar-summary.json')), false);
  write(root, 'radar/output/health.json', { last_scan: scan });
  const accepted = cli();
  assert.equal(accepted.status, 0, accepted.stderr);
  const output = JSON.parse(readFileSync(join(root, 'engine/private/radar-summary.json')));
  assert.equal(output.generatedAt, scan);
});
