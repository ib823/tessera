/**
 * Language Quality Validator
 *
 * Scans every issue's text surfaces (headline, context, card.big, card.sub)
 * for the anti-patterns defined in docs/research/language-quality.md.
 * All findings are WARNINGS — never blocks the build. The validator exits 0.
 *
 * The intent is to surface drift to the writer at build time, not to mechanically
 * enforce style. Some warnings legitimately stand (e.g. "re-export" is the right
 * hyphenated form for ITAR rules). The writer overrides; the validator surfaces.
 *
 * Usage: node scripts/validate-language.mjs [--issue NNNN] [--suggest-vocab] [--verbose]
 *   --issue NNNN       Limit checks to a single issue ID
 *   --suggest-vocab    Emit "elevated-vocabulary opportunity" hints (off by default; noisy)
 *   --verbose          Report passing checks too
 *
 * Exit code: always 0 (warnings only).
 */

import { loadIssues } from './lib/load-issues.mjs';

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const suggestVocab = args.includes('--suggest-vocab');
const issueFilter = (() => {
  const idx = args.indexOf('--issue');
  return idx !== -1 ? args[idx + 1] : null;
})();

const issues = loadIssues();
const targetIssues = issueFilter ? issues.filter((i) => i.id === issueFilter) : issues;

// ──────────────────────────────────────────────────────────────────────────
// PATTERN DICTIONARIES — kept in sync with docs/research/language-quality.md §7
// ──────────────────────────────────────────────────────────────────────────

// Hedges that drain a claim. Case-insensitive substring match.
const HEDGES = [
  'perhaps',
  'appears to',
  'may have',
  'might have',
  'some suggest',
  'some say',
  'it could be argued',
  'it remains to be seen',
  'time will tell',
  'not entirely clear',
  'one could argue',
  'arguably',
];

// Weak abstractions — verbs and phrases that signal "thinkpiece" not "discovery".
// Extends the CLAUDE.md hook-engineering list.
const WEAK_ABSTRACTIONS = [
  'explores',
  'examines',
  'looks at',
  'raises questions about',
  'sparks debate',
  'considers',
  'addresses',
  'tackles',
  'delves into',
  'touches on',
  'discusses',
  'engages with',
  'unpacks',
  'dives into',
  'weighs in on',
];

// Bureaucratic dead-weight. Usually deletable or replaceable with one short word.
const BUREAUCRATIC = [
  'stakeholders',
  'going forward',
  'in terms of',
  'the fact that',
  'at this point in time',
  'it should be noted that',
  'with respect to',
  'in the context of',
  'in light of the fact that',
  'due to the fact that',
  'in order to',
];

// Hyphenated compounds that should close up — see §8.
// Map: bad form → suggested form.
// IMPORTANT: this list contains only compounds where modern style closes the
// hyphen unconditionally. Noun-phrase candidates like `civil-society`,
// `private-sector`, `public-interest` are EXCLUDED because they are
// grammatically correct as compound modifiers before a noun ("civil-society
// petitions", "private-sector firms") and the regex cannot distinguish that
// use from the noun-phrase use ("in the private sector"). Trust the writer.
const HYPHEN_REWRITES = {
  'non-partisan': 'nonpartisan',
  'anti-corruption': 'anticorruption',
  'pre-trial': 'pretrial',
  'co-author': 'coauthor',
  'multi-stage': 'multistage',
  'decision-making': 'decision making',
  'policy-maker': 'policymaker',
  'well-being': 'wellbeing',
};

// Reframe template detectors — flag when 4+ of the last 10 reframes share a template.
// Each regex is run against reframe.big.toLowerCase().
const REFRAME_TEMPLATES = [
  { name: 'is-not-Y-it-is-Z', re: /\bis\s+not\s+[^.]+?\.?\s+(?:it|the)\s+is\b/i },
  { name: 'question-is-not', re: /\bquestion\s+is\s+not\b/i },
  { name: 'isnt-the-X-Y-is', re: /\b(?:isn't|is\s+not)\s+the\s+(?:story|scandal|issue|problem|point)\b/i },
];

// Elevated-vocabulary opportunities — weak verb → suggested elevated alternatives.
// Used only when --suggest-vocab is passed. Kept short to avoid noise.
const VOCAB_OPPORTUNITIES = {
  allowed: ['exempted', 'insulated', 'tolerated', 'forborne'],
  decided: ['arrogated', 'conferred', 'gazetted'],
  changed: ['walked back', 'rolled back', 'rescinded'],
  strengthened: ['entrenched', 'insulated'],
  spread: ['metastasised', 'entrenched'],
  delayed: ['deferred', 'forborne'],
  hidden: ['obfuscated', 'opaque'],
  unclear: ['opaque', 'unrecorded'],
};

// Agentless / by-actor passive detector — flags `was/were [past participle] by`
// and `was/were [past participle]` constructions in claims of accountability.
// Conservative: matches only the most common form so false positives stay low.
const PASSIVE_BY = /\b(was|were)\s+[a-z]+(?:ed|en)\s+by\b/i;

// Em-dash detector — LLM telltale. Generative models default to "—" (U+2014)
// for parenthetical breaks, appositives, and conclusion-setups where human
// writers use commas, colons, periods, or parentheses. Mass em-dash use is
// the single strongest visible signature of LLM-generated prose. T4A's
// editorial voice is human; flag every occurrence.
//
// Replacement guidance (writer judges per instance):
//   "A — B" (parenthetical / aside)   → "A (B)" or "A, B,"
//   "A — B." (conclusion-setup)        → "A. B." or "A: B."
//   "A — B — C" (triple-stack)         → "A, B, C." or split into sentences
//   "A — and B"                        → "A, and B" or "A. And B."
//   Numeric ranges "2020—2025"         → en-dash "2020–2025" (still not em-dash)
const EM_DASH = /—/g;

// Scaffolding discourse markers — sentence-start adverbs that announce a
// logical move the reader should be able to see for themselves. Strong logic
// does not need scaffolding. Match only at sentence start (beginning of text
// OR after .!?  followed by space). The trailing comma is required; without
// it these words have other valid uses ("crucial evidence", "the moreover
// motion").
const SCAFFOLDING_MARKERS = [
  'however',
  'moreover',
  'furthermore',
  'nevertheless',
  'additionally',
  'crucially',
  'notably',
  'importantly',
  'significantly',
  'that said',
  'of course',
  'interestingly',
  'indeed',
];

// Auxiliary-verb density — three or more to-be auxiliaries in a single field
// signals weak verb selection. Words: is, are, was, were, be, been, being.
// Match as whole words (case-insensitive). Contractions ("it's", "you're")
// are excluded since they rarely appear in T4A's formal register.
const TO_BE_AUXILIARIES = /\b(is|are|was|were|be|been|being)\b/gi;
const TO_BE_THRESHOLD = 3;

// ──────────────────────────────────────────────────────────────────────────
// COLLECTORS
// ──────────────────────────────────────────────────────────────────────────

const warnings = [];
let passCount = 0;

function warn(issueId, field, category, msg) {
  warnings.push({ id: issueId, field, category, msg });
}
function pass(msg) {
  passCount++;
  if (verbose) console.log(`  ✓ ${msg}`);
}

// Context-aware exclusions for the weak-abstraction category. Each entry maps
// a flagged phrase to a predicate that returns true when this *specific*
// occurrence is actually a legitimate use rather than the anti-pattern. The
// substring scan cannot tell e.g. the verb "addresses" from the noun in "IP
// addresses", or the verb "considers" from the threshold idiom "considers
// anything above X" — so we filter at the position level rather than blacklist
// at the phrase level.
const WEAK_EXCLUSIONS = {
  addresses: (text, pos) => {
    // Treat as noun (skip) when preceded within 2 words by a network-noun
    // qualifier. "1,200 Malaysian IP addresses" → noun. "Article 12(4) addresses
    // children's religious education" → verb (no qualifier match).
    const before = text.slice(Math.max(0, pos - 40), pos).toLowerCase();
    return /\b(ip|email|e-mail|physical|home|street|office|postal|mailing|web|url|server|mac)\b[^.]{0,15}$/i.test(before);
  },
  considers: (text, pos) => {
    // Threshold-classification idiom: "considers anything above X", "considers
    // X as Y", "considers more than Z". Verb-of-classification, not weak
    // thinkpiece "considers".
    const after = text.slice(pos + 'considers'.length, pos + 'considers'.length + 60).toLowerCase();
    return /^\s*(anything\s+(above|below|over|under|more|less)|more\s+than|less\s+than|values?\s+(above|below|over|under)|.{1,30}\s+as\s+)/i.test(after);
  },
};

function scanPhrases(issueId, field, text, phrases, category, formatMsg) {
  if (!text) return;
  const lower = text.toLowerCase();
  for (const phrase of phrases) {
    let pos = 0;
    while (pos < lower.length) {
      const idx = lower.indexOf(phrase, pos);
      if (idx === -1) break;
      const excluded = category === 'weak-abstraction' &&
        WEAK_EXCLUSIONS[phrase] &&
        WEAK_EXCLUSIONS[phrase](text, idx);
      if (!excluded) {
        warn(issueId, field, category, formatMsg(phrase));
        break; // one warning per phrase per text, matches old behavior
      }
      pos = idx + phrase.length;
    }
  }
}

// Proper-noun guard for hyphenated compounds. "Anti-Corruption Plan" (both
// halves Title-Cased and followed by another Title-Cased word) is part of an
// official name (e.g., Malaysia's National Anti-Corruption Plan). Closing
// the hyphen would rewrite a proper noun. The check is per-occurrence on the
// original case-preserving text.
function isProperNounAtPosition(text, idx, phrase) {
  const occurrence = text.slice(idx, idx + phrase.length);
  // Both halves of the compound must be capitalized for proper-noun candidacy.
  const halves = occurrence.split('-');
  if (halves.length !== 2) return false;
  if (!/^[A-Z]/.test(halves[0]) || !/^[A-Z]/.test(halves[1])) return false;
  // Look for a Title-Cased word immediately following (e.g., "Plan",
  // "Commission", "Court", "Agency", "Act"). This is the proper-noun signal.
  const after = text.slice(idx + phrase.length);
  return /^\s+[A-Z][a-z]+/.test(after);
}

function scanHyphens(issueId, field, text) {
  if (!text) return;
  const lower = text.toLowerCase();
  for (const [bad, good] of Object.entries(HYPHEN_REWRITES)) {
    let pos = 0;
    while (pos < lower.length) {
      const idx = lower.indexOf(bad, pos);
      if (idx === -1) break;
      if (!isProperNounAtPosition(text, idx, bad)) {
        warn(issueId, field, 'hyphenated-compound', `"${bad}" → consider "${good}"`);
        break; // one warning per phrase per text, matches old behavior
      }
      pos = idx + bad.length;
    }
  }
}

// Temporal "by" — "was excised by 2006", "was completed by year-end".
// These are not agent-introducers; "by" here is a deadline preposition.
// Detect by checking the word(s) immediately after the matched "by".
const TEMPORAL_BY_AFTER = /^\s+(\d{4}|now|then|year[- ]end|month[- ]end|the\s+(end|start|beginning|deadline|time))\b/i;

function scanPassive(issueId, field, text) {
  if (!text) return;
  const m = text.match(PASSIVE_BY);
  if (!m) return;
  // Check what follows the matched "...by". If it's a temporal noun, skip.
  const matchEnd = m.index + m[0].length;
  const after = text.slice(matchEnd);
  if (TEMPORAL_BY_AFTER.test(after)) return;
  warn(
    issueId,
    field,
    'agentless-passive',
    `passive-by construction: "${m[0]}" — consider active voice naming the agent`,
  );
}

function scanEmDash(issueId, field, text) {
  if (!text) return;
  const matches = text.match(EM_DASH);
  if (!matches) return;
  const count = matches.length;
  // One warning per field, even if multiple dashes. Includes count in message
  // so dash-heavy fields are visible at a glance.
  warn(
    issueId,
    field,
    'em-dash',
    `${count} em-dash${count > 1 ? 'es' : ''} (—) — LLM telltale. Replace with comma, colon, period, or parentheses depending on context. See docs/research/language-quality.md §10.`,
  );
}

function scanScaffolding(issueId, field, text) {
  if (!text) return;
  // Split on sentence boundaries: keep clauses that follow ., !, ? or are at start.
  // We test each sentence's first word(s) against the marker list.
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    const trimmed = s.trimStart();
    for (const marker of SCAFFOLDING_MARKERS) {
      // Marker must be followed by comma to qualify as a discourse marker
      // (otherwise the word may be doing other work — "Notable cases include",
      // "Of course the question is also").
      const re = new RegExp(`^${marker.replace(/ /g, '\\s+')}\\s*,`, 'i');
      if (re.test(trimmed)) {
        warn(
          issueId,
          field,
          'scaffolding-marker',
          `sentence-start "${marker.charAt(0).toUpperCase() + marker.slice(1)}," — strong logic does not need announcing. See docs/research/language-quality.md §8.`,
        );
        break; // one per sentence
      }
    }
  }
}

function scanAuxiliaryDensity(issueId, field, text) {
  if (!text) return;
  const matches = text.match(TO_BE_AUXILIARIES);
  if (!matches) return;
  const count = matches.length;
  if (count < TO_BE_THRESHOLD) return;
  warn(
    issueId,
    field,
    'auxiliary-density',
    `${count} to-be auxiliaries (${[...new Set(matches.map((m) => m.toLowerCase()))].join('/')}) — verb-driven prose is stronger. See docs/research/language-quality.md §7.1.`,
  );
}

function scanVocab(issueId, field, text) {
  if (!text) return;
  const lower = text.toLowerCase();
  for (const [weak, suggestions] of Object.entries(VOCAB_OPPORTUNITIES)) {
    const re = new RegExp(`\\b${weak}\\b`, 'i');
    if (re.test(lower)) {
      warn(
        issueId,
        field,
        'vocab-opportunity',
        `"${weak}" — consider one of: ${suggestions.join(', ')} (see docs/research/language-quality.md §6)`,
      );
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// PER-ISSUE TEXT SCAN
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n  Scanning language quality on ${targetIssues.length} issues...\n`);

for (const issue of targetIssues) {
  const id = issue.id ?? '???';

  const surfaces = [];
  if (issue.headline) surfaces.push({ field: 'headline', text: issue.headline });
  if (issue.context) surfaces.push({ field: 'context', text: issue.context });
  if (Array.isArray(issue.cards)) {
    for (let ci = 0; ci < issue.cards.length; ci++) {
      const c = issue.cards[ci];
      const label = `cards[${ci}].${c.t}`;
      if (c.big) surfaces.push({ field: `${label}.big`, text: c.big });
      if (c.sub) surfaces.push({ field: `${label}.sub`, text: c.sub });
    }
  }

  for (const { field, text } of surfaces) {
    scanPhrases(id, field, text, HEDGES, 'hedge', (p) => `hedge: "${p}" — drains the claim. Drop or commit.`);
    scanPhrases(
      id,
      field,
      text,
      WEAK_ABSTRACTIONS,
      'weak-abstraction',
      (p) => `weak abstraction: "${p}" — signals thinkpiece, not discovery. Use a verb of action/finding.`,
    );
    scanPhrases(
      id,
      field,
      text,
      BUREAUCRATIC,
      'bureaucratic',
      (p) => `bureaucratic: "${p}" — usually deletable or replaceable with one short word.`,
    );
    scanHyphens(id, field, text);
    scanPassive(id, field, text);
    scanEmDash(id, field, text);
    scanScaffolding(id, field, text);
    scanAuxiliaryDensity(id, field, text);
    if (suggestVocab) scanVocab(id, field, text);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// CROSS-ISSUE REFRAME-TEMPLATE DRIFT (last 10 published reframes)
// ──────────────────────────────────────────────────────────────────────────

// Sort by ID descending (newest first), take published only, scan reframe.big.
const published = issues
  .filter((i) => i.published)
  .sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
const recent = published.slice(0, 10);

const templateCounts = {};
for (const tpl of REFRAME_TEMPLATES) templateCounts[tpl.name] = [];

for (const i of recent) {
  if (!Array.isArray(i.cards)) continue;
  const r = i.cards.find((c) => c.t === 'reframe');
  if (!r || !r.big) continue;
  for (const tpl of REFRAME_TEMPLATES) {
    if (tpl.re.test(r.big)) {
      templateCounts[tpl.name].push({ id: i.id, big: r.big });
    }
  }
}

const REFRAME_DRIFT_THRESHOLD = 4;
let driftFlagged = false;
for (const [name, hits] of Object.entries(templateCounts)) {
  if (hits.length >= REFRAME_DRIFT_THRESHOLD) {
    driftFlagged = true;
    const idList = hits.map((h) => h.id).join(', ');
    warn(
      'global',
      'reframe-template-drift',
      'reframe-template',
      `template "${name}" used in ${hits.length} of last 10 reframes: ${idList}. Vary the rhetorical shape — see docs/research/language-quality.md §7.`,
    );
  }
}
if (!driftFlagged) pass('Reframe templates across last 10 issues are sufficiently varied');

// ──────────────────────────────────────────────────────────────────────────
// REPORT
// ──────────────────────────────────────────────────────────────────────────

const warnCount = warnings.length;

if (warnCount > 0) {
  console.log(`  WARNINGS (${warnCount}):\n`);
  const grouped = {};
  for (const w of warnings) {
    if (!grouped[w.id]) grouped[w.id] = [];
    grouped[w.id].push(w);
  }
  const warnIssues = Object.entries(grouped);
  const shown = warnIssues.slice(0, 20);
  for (const [id, wrns] of shown) {
    console.log(`  Issue ${id}:`);
    for (const w of wrns) {
      console.log(`    ⚠ ${w.field} [${w.category}]: ${w.msg}`);
    }
  }
  if (warnIssues.length > 20) {
    console.log(`  ... and ${warnIssues.length - 20} more issues with warnings`);
  }
  console.log('');
}

console.log('  ─────────────────────────────────');
console.log(`  Issues scanned: ${targetIssues.length}`);
console.log(`  Warnings:       ${warnCount}`);
console.log(`  Reference:      docs/research/language-quality.md`);
console.log('  ─────────────────────────────────');
console.log(`\n  ✓ Language scan complete${warnCount > 0 ? ` (${warnCount} warnings)` : ''}.\n`);

process.exit(0);
