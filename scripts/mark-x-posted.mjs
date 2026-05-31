#!/usr/bin/env node
/**
 * mark-x-posted.mjs — flip an inventory entry to POSTED and rebuild the views.
 *
 * Usage:
 *   node scripts/mark-x-posted.mjs 2001            # marks issue 2001 posted (X)
 *   node scripts/mark-x-posted.mjs 2001 x,bluesky  # record specific platforms
 *   node scripts/mark-x-posted.mjs 2001 --undo     # revert to PENDING
 *
 * Writes status + timestamp into social/x-inventory.json, then re-runs the
 * builder so social/x-inventory.md reflects it. Commit the result.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STATE_PATH = join(ROOT, 'social', 'x-inventory.json');

const id = process.argv[2];
const arg3 = process.argv[3];
if (!id) {
  console.error('Usage: node scripts/mark-x-posted.mjs <issueId> [platforms|--undo]');
  process.exit(1);
}
const undo = arg3 === '--undo';
const platforms = arg3 && !undo ? arg3.split(',').map((s) => s.trim()).filter(Boolean) : ['x'];

const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
const entry = (state.entries || []).find((e) => String(e.id) === String(id));
if (!entry) {
  console.error(`Issue ${id} not found in inventory. Run: node scripts/build-x-inventory.mjs`);
  process.exit(1);
}

if (undo) {
  entry.status = 'PENDING';
  entry.postedAt = null;
  entry.postedPlatforms = [];
  console.log(`Issue ${id} reverted to PENDING.`);
} else {
  entry.status = 'POSTED';
  entry.postedAt = new Date().toISOString();
  entry.postedPlatforms = platforms;
  console.log(`Issue ${id} marked POSTED (${platforms.join('+')}) at ${entry.postedAt}.`);
}

writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
// Rebuild the markdown view (status is preserved by the builder).
execFileSync(process.execPath, [join(__dirname, 'build-x-inventory.mjs')], { stdio: 'inherit' });
