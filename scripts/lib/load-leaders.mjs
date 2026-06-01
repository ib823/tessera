import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const leadersDir = join(__dirname, '..', '..', 'src', 'data', 'leaders');
const methodologyPath = join(
  __dirname,
  '..',
  '..',
  'src',
  'data',
  'leaderboard',
  'methodology.json',
);

/** Load every leader profile JSON. Returns [] in framework mode (M0). */
export function loadLeaders() {
  if (!existsSync(leadersDir)) return [];
  return readdirSync(leadersDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(leadersDir, f), 'utf8')));
}

/** Load the single methodology config — the source of truth for symmetry. */
export function loadMethodology() {
  return JSON.parse(readFileSync(methodologyPath, 'utf8'));
}

export function getLeadersDir() {
  return leadersDir;
}

export function getMethodologyPath() {
  return methodologyPath;
}
