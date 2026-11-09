/**
 * Generates JSON data files from issues.ts at build time:
 * - public/issues-feed.json  — feed summaries (no card text)
 * - public/issues/[id].json  — full issue per file
 */
import { writeFileSync, mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIssues } from './lib/load-issues.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const issues = loadIssues();

// --- Filter to published issues only for the feed ---
// Retired issues (retired:true) are excluded entirely — no feed entry, no
// per-issue JSON. /issue/{id} returns 404 because the reader fetch finds
// no JSON. Retired implies the editorial premise was factually wrong and
// the issue cannot be rewritten (e.g. claim reversal, fabricated study).
const retiredIssues = issues.filter(i => i.retired === true);
if (retiredIssues.length > 0) {
  console.log(`Retired (excluded from build): ${retiredIssues.length} — ${retiredIssues.map(i => i.id).join(', ')}`);
}
const publishedIssues = issues.filter(i => i.published === true && i.retired !== true);
console.log(`Issues: ${issues.length} total, ${publishedIssues.length} published`);

// --- Feed summaries: strip card big/sub text ---
const bgDir = join(root, 'public', 'og', 'backgrounds');
const feedSummaries = publishedIssues.map(issue => {
  return {
    id: issue.id,
    opinionShift: issue.opinionShift,
    status: issue.status,
    edition: issue.edition,
    headline: issue.headline,
    context: issue.context,
    stageScores: issue.stageScores,
    finalScore: issue.finalScore,
    hasImage: existsSync(join(bgDir, `issue-${issue.id}-bg.jpg`)) || existsSync(join(bgDir, `issue-${issue.id}-bg.png`)),
    sourceDate: issue.sourceDate || null,
    // Publication history: the feed rows' "Updated since you read it" badge
    // compares modifiedAt with the reader's completion time. changes[] stays
    // in the per-issue payload only.
    publishedAt: issue.publishedAt || undefined,
    modifiedAt: issue.modifiedAt || undefined,
    type: issue.type || undefined,
    // Keep card structure for category derivation and card count, but strip body text
    cards: issue.cards.map(c => ({ t: c.t, lens: c.lens })),
    legacyAudit: issue.legacyAudit === true ? true : undefined,
  };
});

writeFileSync(
  join(root, 'public', 'issues-feed.json'),
  JSON.stringify(feedSummaries),
  'utf8'
);
console.log(`  ✓ issues-feed.json (${feedSummaries.length} issues, ${Math.round(JSON.stringify(feedSummaries).length / 1024)}KB)`);

const issuesDir = join(root, 'public', 'issues');
rmSync(issuesDir, { recursive: true, force: true });
mkdirSync(issuesDir, { recursive: true });

// --- Per-issue full payloads (published only) ---
// `sourceList` comes from src/data/sources/{id}.json (scripts/build-issue-sources.mjs,
// which runs before this script). Only the reader-facing fields are shipped.
const sourcesDir = join(root, 'src', 'data', 'sources');
let withSources = 0;
for (const issue of publishedIssues) {
  const sourcesPath = join(sourcesDir, `${issue.id}.json`);
  let payload = issue;
  if (existsSync(sourcesPath)) {
    const { entries } = JSON.parse(readFileSync(sourcesPath, 'utf8'));
    payload = {
      ...issue,
      sourceList: entries.map(({ n, ref, title, publisher, date, url, primary }) => ({ n, ref: String(ref), title, publisher, date, url, primary })),
    };
    withSources += 1;
  }
  writeFileSync(
    join(issuesDir, `${issue.id}.json`),
    JSON.stringify(payload),
    'utf8'
  );
}
console.log(`  ✓ issues/*.json (${publishedIssues.length} files, ${withSources} with a source list)`);
