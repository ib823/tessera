#!/usr/bin/env node
/**
 * Extract candidate event records from T4A issues into engine/sim/data/staging/.
 *
 * This is the corpus-walker for Phase 2b-iii: turns the manual encoding wall
 * (~800 events) into a review pipeline. The extractor produces CANDIDATE
 * records that humans review before promotion to engine/sim/data/events/.
 *
 * Discipline:
 * - Auto-extraction can MISCLASSIFY event types, MISS actors, and INVENT
 *   confidence. Candidates carry `_status: "candidate"` and must be
 *   human-reviewed before promotion. The T4A issue itself is NOT a primary
 *   source — it is a secondary reference to underlying primary sources that
 *   the reviewer must add explicitly.
 * - Default confidence on candidates is "LOW" pending review.
 *
 * Promotion workflow:
 * 1. Open the candidate in engine/sim/data/staging/.
 * 2. Verify event type, date, actors.
 * 3. Add primary_sources from the issue's underlying citations.
 * 4. Set confidence to HIGH/MED based on source quality.
 * 5. Set legitimacy_delta and cleavages_activated by editorial judgement.
 * 6. Move file from staging/ to events/YYYY/, dropping all `_extractor_*` fields.
 * 7. Run scripts/sim-data-check.mjs --strict to verify.
 *
 * Usage:
 *   node scripts/sim-extract-events.mjs                 # all issues
 *   node scripts/sim-extract-events.mjs --since 2026-01 # by sourceDate
 *   node scripts/sim-extract-events.mjs --range 1900-2000
 *   node scripts/sim-extract-events.mjs --issue 1944
 *   node scripts/sim-extract-events.mjs --dry-run       # print summary, write nothing
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const ROOT = new URL("../", import.meta.url).pathname;
const ISSUES_DIR = join(ROOT, "src/data/issues");
const ACTORS_DIR = join(ROOT, "engine/sim/data/actors");
const INSTITUTIONS_DIR = join(ROOT, "engine/sim/data/institutions");
const STAGING_DIR = join(ROOT, "engine/sim/data/staging");

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function ulid() {
  let t = BigInt(Date.now());
  let time = "";
  for (let i = 0; i < 10; i++) { time = ALPHABET[Number(t % 32n)] + time; t /= 32n; }
  const bytes = randomBytes(10);
  let r = 0n;
  for (const b of bytes) r = (r << 8n) | BigInt(b);
  let rand = "";
  for (let i = 0; i < 16; i++) { rand = ALPHABET[Number(r % 32n)] + rand; r /= 32n; }
  return time + rand;
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyIssue = args.find((a, i) => args[i - 1] === "--issue");
const since = args.find((a, i) => args[i - 1] === "--since");
const range = args.find((a, i) => args[i - 1] === "--range");
let rangeFrom = null, rangeTo = null;
if (range) {
  const [from, to] = range.split("-");
  rangeFrom = parseInt(from, 10); rangeTo = parseInt(to, 10);
}

// Build entity index from actor canonical_name + aliases
const entityIndex = new Map(); // lowercased-name → ulid
function indexActor(file) {
  const obj = JSON.parse(readFileSync(file, "utf8"));
  const names = [obj.canonical_name, ...(obj.aliases || [])];
  for (const name of names) {
    if (!name) continue;
    entityIndex.set(name.toLowerCase(), obj.id);
    // Also index single-word short forms (e.g. "Najib")
    const firstWord = name.split(" ")[0];
    if (firstWord.length > 3) entityIndex.set(firstWord.toLowerCase(), obj.id);
  }
}
for (const f of readdirSync(ACTORS_DIR)) {
  if (f.endsWith(".json")) indexActor(join(ACTORS_DIR, f));
}

// Period from year
function periodForYear(y) {
  if (y < 1786) return "P1";
  if (y < 1957) return "P2";
  if (y < 1969) return "P3";
  if (y < 1998) return "P4";
  if (y < 2008) return "P5";
  if (y < 2018) return "P6";
  return "P7";
}

// Event type heuristics. Order matters — first match wins.
const TYPE_RULES = [
  { type: "Election", re: /\b(general election|GE1[0-9]|state election|by-election|polling|nominat[ie]|election commission)/i },
  { type: "TrialVerdict", re: /\b(convicted|acquittal|acquitted|DNAA|sentence|charged|verdict|appeal (dismissed|allowed)|guilty|imprison)/i },
  { type: "ConstitutionalAmendment", re: /\b(constitutional amendment|amend(ed|ing) the constitution|article \d+|two-thirds majority|two[- ]thirds threshold)/i },
  { type: "RoyalIntervention", re: /\b(YDPA|sultan|conference of rulers|royal (proclamation|pardon|decree|consent)|king's|palace|istana|daulat)/i },
  { type: "Protest", re: /\b(protest|rally|demonstration|himpunan|mobilis(at|ed)|gathering|police reports)/i },
  { type: "CoalitionFormation", re: /\b(coalition (formed|formation|dissolved)|alliance founded|pakatan harapan|perikatan nasional|barisan nasional formed|muafakat)/i },
  { type: "InstitutionalCreation", re: /\b(established|founded|created|launched|set up).*\b(commission|ministry|agency|institution|authority)/i },
  { type: "ElitePersonnelChange", re: /\b(resign(ed|ation)?|appointed|sacked|dismissed|defect(ion|ed)|expelled|sworn in|new minister|cabinet reshuffle|tendered)/i },
  { type: "ScandalRevelation", re: /\b(scandal|leaked|whistleblow|audit (found|revealed)|investigation|allegat|exposed|RM[\d.,]+\s?[bm]illion (paid|missing|stolen|laundered))/i },
  { type: "ResourceTransfer", re: /\b(awarded contract|tender|concession|RM[\d.,]+\s?[bm]illion contract|grant|subsidy|loan|equity injection|donation|bribe|kickback)/i },
  { type: "DiscursiveEvent", re: /\b(speech|statement|press conference|ceramah|sermon|televised|address(ed|ing) parliament|interview)/i },
  { type: "DemographicShift", re: /\b(census|population (rose|fell|grew|declined)|urbanisation|migration|fertility|birth rate)/i },
  { type: "LegislativeVote", re: /\b(bill (passed|tabled|withdrawn|defeated)|second reading|third reading|parliament (passed|voted|rejected)|amendment vote)/i },
  { type: "ExogenousShock", re: /\b(global financial crisis|pandemic|COVID|tsunami|earthquake|monsoon|trade war|sanctions)/i },
];

function classifyEvent(issue) {
  const blob = [issue.headline, issue.context, ...((issue.cards || []).flatMap(c => [c.big, c.sub]))].join(" ");
  for (const rule of TYPE_RULES) {
    if (rule.re.test(blob)) return rule.type;
  }
  return "PolicyAnnouncement";
}

function findActors(issue) {
  const blob = [issue.headline, issue.context, ...((issue.cards || []).flatMap(c => [c.big, c.sub]))].join(" ").toLowerCase();
  const found = new Set();
  for (const [name, ulid] of entityIndex) {
    if (blob.includes(name)) found.add(ulid);
  }
  return [...found];
}

function dateFromIssue(issue) {
  if (issue.sourceDate) return issue.sourceDate;
  // try to find a date in the headline or context
  const blob = `${issue.headline || ""} ${issue.context || ""}`;
  const m = blob.match(/\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4}))/i);
  if (m) {
    const parts = m[1].split(/\s+/);
    const months = { january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08", september: "09", october: "10", november: "11", december: "12" };
    return `${parts[2]}-${months[parts[1].toLowerCase()]}-${parts[0].padStart(2, "0")}`;
  }
  const yearOnly = blob.match(/\b(20\d{2})\b/);
  if (yearOnly) return yearOnly[1];
  return null;
}

function shouldInclude(issue) {
  if (onlyIssue && issue.id !== onlyIssue) return false;
  if (rangeFrom !== null) {
    const idn = parseInt(issue.id, 10);
    if (idn < rangeFrom || idn > rangeTo) return false;
  }
  if (since && issue.sourceDate && issue.sourceDate < since) return false;
  return true;
}

// Walk issues
if (!existsSync(STAGING_DIR)) mkdirSync(STAGING_DIR, { recursive: true });

let processed = 0;
let written = 0;
const typeCounts = {};
const issueFiles = readdirSync(ISSUES_DIR).filter(f => f.endsWith(".json")).sort();
const skipReasons = { not_published: 0, no_date: 0, filter: 0 };

for (const f of issueFiles) {
  const issue = JSON.parse(readFileSync(join(ISSUES_DIR, f), "utf8"));
  if (!shouldInclude(issue)) { skipReasons.filter++; continue; }
  if (issue.published === false) { skipReasons.not_published++; continue; }
  const date = dateFromIssue(issue);
  if (!date) { skipReasons.no_date++; continue; }

  processed++;
  const eventType = classifyEvent(issue);
  typeCounts[eventType] = (typeCounts[eventType] || 0) + 1;

  const id = ulid();
  const year = date.slice(0, 4);
  const candidate = {
    id,
    type: eventType,
    date_start: date,
    period: periodForYear(parseInt(year, 10)),
    confidence: "LOW",
    primary_sources: [
      {
        tier: 3,
        type: "press-mainstream",
        title: `[REVIEWER: replace with primary sources cited in T4A issue ${issue.id}]`
      }
    ],
    actors_involved: findActors(issue),
    cleavages_activated: [],
    legitimacy_delta: {},
    t4a_issue_refs: [issue.id],
    notes: `Candidate extracted from T4A issue ${issue.id}: "${issue.headline}". REVIEW REQUIRED — verify event type, add type-specific fields, add primary sources from the issue's underlying citations, set legitimacy_delta and cleavages_activated by editorial judgement.`,
    _status: "candidate",
    _extracted_from_issue: issue.id,
    _extracted_at: new Date().toISOString(),
    _extractor_classified_type: eventType,
    _issue_headline: issue.headline,
    _issue_context: issue.context
  };

  const outPath = join(STAGING_DIR, `${id}-issue-${issue.id}.json`);
  if (!dryRun) {
    writeFileSync(outPath, JSON.stringify(candidate, null, 2) + "\n");
    written++;
  }
}

console.log("");
console.log(`Issues processed:  ${processed}`);
console.log(`Candidates written: ${written}${dryRun ? " (dry-run)" : ""}`);
console.log(`Skipped:           ${Object.entries(skipReasons).filter(([_, n]) => n > 0).map(([k, n]) => `${k}=${n}`).join(", ") || "none"}`);
console.log("");
console.log("Event-type distribution:");
for (const [t, n] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(28)} ${n}`);
}
console.log("");
console.log(`Entity index size: ${entityIndex.size}`);
console.log("");
console.log("Promotion workflow:");
console.log("  1. Open engine/sim/data/staging/<file>");
console.log("  2. Verify event type and add type-specific fields");
console.log("  3. Add primary_sources from the issue's underlying citations");
console.log("  4. Set confidence (HIGH/MED), legitimacy_delta, cleavages_activated");
console.log("  5. Drop all _extractor_* and _status / _issue_* fields");
console.log("  6. Move to engine/sim/data/events/YYYY/<ulid>.json");
console.log("  7. Run: node scripts/sim-data-check.mjs --strict");
