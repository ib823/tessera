/**
 * Brief SOURCES parser.
 *
 * Turns the numbered SOURCES bibliography of an engine research brief
 * (engine/briefs/{slug}.md) into reader-facing entries:
 *
 *   { ref, title, publisher, date, url, primary }
 *
 * The parser only ever REMOVES text from a brief citation. It never adds,
 * rewrites or "fixes" a title, publisher, date or URL. Everything it strips
 * is internal workflow material: [P]/[S] markers (kept as the `primary`
 * boolean), source IDs ([S4], A1., P1.), verbatim evidence quotes,
 * editor and verification notes, GAP references and retrieval notes.
 *
 * Entries are dropped (with a reason) when they are internal cross-references
 * to T4A's own issues or files, unverified placeholders, logged for exclusion,
 * or marked as not yet opened. A SOURCES section headed "(to compile)" is a
 * plan, not a bibliography, and yields no entries.
 *
 * Briefs vary a lot in format. The variants this handles, all taken from real
 * briefs, are covered by src/lib/__tests__/brief-sources.test.ts.
 */

// ── Dates ──────────────────────────────────────────────────────────────────

const MONTH =
  '(?:Jan(?:uary|uari)?|Feb(?:ruary|ruari)?|Mar(?:ch)?|Mac|Apr(?:il)?|May|Mei|Jun(?:e)?|Jul(?:y|ai)?|Aug(?:ust)?|Ogos|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Oktober|Nov(?:ember)?|Dec(?:ember)?|Disember)';
const DATE_PATTERNS = [
  // 6 Aug 2021 · 13 June 2024 · 30 Ogos 2022
  new RegExp(`\\b\\d{1,2}(?:\\s*[–-]\\s*\\d{1,2})?\\s+${MONTH}\\.?,?\\s+\\d{4}\\b`),
  // Jan 23, 2026 · Mar 29 2024
  new RegExp(`\\b${MONTH}\\.?\\s+\\d{1,2},?\\s+\\d{4}\\b`),
  // 2026-04-29
  /\b\d{4}-\d{2}-\d{2}\b/,
  // Feb 2026 · June 2024
  new RegExp(`\\b${MONTH}\\.?\\s+\\d{4}\\b`),
  // 2026-04
  /\b\d{4}-\d{2}\b(?!-)/,
  // 2019–2020 · 2026
  /\b(?:19|20)\d{2}(?:\s*[–-]\s*(?:19|20)?\d{2})?\b/,
];
const DATE_ANY = new RegExp(DATE_PATTERNS.map((r) => r.source).join('|'));

/** First date in `text`, most specific pattern first. Returns {date,index}|null. */
export function findDate(text) {
  if (!text) return null;
  for (const re of DATE_PATTERNS) {
    const m = re.exec(text);
    if (m) return { date: m[0].trim(), index: m.index };
  }
  return null;
}

/** True when `text` is nothing but a date. */
function isOnlyDate(text) {
  const t = text.trim().replace(/[.,;]+$/, '');
  const m = DATE_ANY.exec(t);
  return Boolean(m && m.index === 0 && m[0].length === t.length);
}

// ── Section location ───────────────────────────────────────────────────────

const MD_SOURCES_HEADING = /^#{1,4}\s+(?:ADDITIONAL\s+)?SOURCES\b/i;
const PLAIN_SOURCES_HEADING = /^(?:ADDITIONAL\s+)?SOURCES(?:\s+[A-Z]+)*\s*:\s*$/;
const PLAIN_CAPS_LABEL = /^[A-Z][A-Z0-9 &/()'’-]{2,}:\s*$/;

/**
 * Locate every SOURCES section in a brief.
 * @param {string} markdown
 * @returns {{ heading: string, planned: boolean, lines: string[] }[]}
 */
export function findSourcesSections(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const t = line.trim();
    const isSourcesHeading = MD_SOURCES_HEADING.test(t) || PLAIN_SOURCES_HEADING.test(t);
    if (isSourcesHeading && (current === null || /^#{1,2}\s/.test(t) || PLAIN_SOURCES_HEADING.test(t))) {
      current = { heading: t, planned: /\bto compile\b/i.test(t), lines: [] };
      sections.push(current);
      continue;
    }
    if (current) {
      const endsSection =
        /^#{1,2}\s/.test(t) || // next top-level section
        /^---+$/.test(t) || // horizontal rule
        (PLAIN_CAPS_LABEL.test(t) && !isSourcesHeading && !/^(?:PRIMARY|SECONDARY)\b/.test(t));
      if (endsSection) {
        current = null;
        continue;
      }
      current.lines.push(line);
    }
  }
  return sections;
}

// ── Sub-headings inside a SOURCES section ──────────────────────────────────

/**
 * Return the heading text when `line` is a sub-heading, else null.
 * Sub-headings start in column 0; an indented "Retrieved via Malay Mail:" is
 * the continuation of a wrapped entry, not a heading.
 */
function subheadingText(line) {
  if (/^\s/.test(line)) return null;
  const t = line.trim();
  let m = /^#{3,6}\s+(.+)$/.exec(t);
  if (m) return m[1];
  // **Primary (government / regulator / court documents):**  ·  **Primary** (opened and read)
  m = /^\*\*([^*]+?)\*\*\s*:?\s*(\([^)]*\))?\s*:?\s*$/.exec(t);
  if (m) return `${m[1]} ${m[2] ?? ''}`.trim();
  // PRIMARY (statutes, court records, agency actions):  ·  Primary / quasi-primary:
  m = /^([A-Z][^.!?`]{2,140}):\s*$/.exec(t);
  if (m && !/https?:\/\//.test(t)) return m[1];
  return null;
}

/** Does a sub-heading classify the entries below it as primary sources? */
export function headingIsPrimary(heading) {
  const t = heading.replace(/[*_#:]/g, ' ').replace(/\s+/g, ' ').trim();
  const core = t.replace(/^tier\s+\w+\s*[—–-]\s*/i, '');
  if (/quasi/i.test(core)) return false;
  if (/^primary\b(?!\s+reporting)(?!-)/i.test(core)) return true;
  if (/\(primary\)\s*$/i.test(core)) return true;
  return false;
}

/** Sub-sections that list T4A's own issues rather than sources. */
function headingIsInternal(heading) {
  return /\bT4A\b|published (?:T4A )?issues/i.test(heading);
}

// ── Entry detection ────────────────────────────────────────────────────────

const NUMBERED_ENTRY = /^\s{0,3}(\d{1,3}[a-z]?)[.)]\s+(.*)$/;
const LABELLED_ENTRY = /^\s{0,3}([A-Z]{1,2}\d{1,3}[a-z]?)[.)]\s+(.*)$/;
const BULLET_ENTRY = /^\s{0,3}[-•]\s+(.*)$|^\s{0,3}\*\s+(.*)$/;

/**
 * Split a SOURCES section into raw entries.
 * Numbered lists win: when a section has numbered entries, bullets in it are
 * notes. Otherwise bullets are the entries (bullet-style briefs).
 */
function collectRawEntries(sectionLines) {
  const hasNumbered = sectionLines.some((l) => NUMBERED_ENTRY.test(l) || LABELLED_ENTRY.test(l));
  const entries = [];
  let current = null;
  let sectionPrimary = false;
  let sectionInternal = false;

  const close = () => {
    if (current) entries.push(current);
    current = null;
  };

  for (const line of sectionLines) {
    const t = line.trim();
    if (t === '') {
      close();
      continue;
    }
    const heading = subheadingText(line);
    const numbered = NUMBERED_ENTRY.exec(line) || LABELLED_ENTRY.exec(line);
    const bullet = !hasNumbered ? BULLET_ENTRY.exec(line) : null;
    if (heading && !numbered && !bullet) {
      close();
      sectionPrimary = headingIsPrimary(heading);
      sectionInternal = headingIsInternal(heading);
      continue;
    }
    if (numbered) {
      close();
      current = { ref: numbered[1], text: numbered[2], sectionPrimary, sectionInternal };
      continue;
    }
    if (bullet) {
      close();
      let body = (bullet[1] ?? bullet[2] ?? '').trim();
      // "- P1. SPR ..." — a labelled entry inside a bullet
      const inner = /^([A-Z]{1,2}\d{1,3}[a-z]?)[.)]\s+(.*)$/.exec(body);
      let ref = null;
      if (inner) {
        ref = inner[1];
        body = inner[2];
      }
      current = { ref, text: body, sectionPrimary, sectionInternal };
      continue;
    }
    if (current) {
      // Continuation of a wrapped entry.
      current.text += ` ${t}`;
    }
    // Otherwise a paragraph note inside the section: ignored.
  }
  close();
  return entries;
}

// ── Classification ─────────────────────────────────────────────────────────

/**
 * Explicit primary/secondary marker on an entry: true, false or null (none).
 * Secondary markers win over primary ones ("PRIMARY-citing" is secondary).
 */
export function explicitPrimary(raw) {
  if (/\[\s*S\s*(?:→|->|:|,|\])/.test(raw)) return false; // [S] [S→P] [S: x] [S, x]
  if (/PRIMARY[-\s]citing|citing primary|\bsecondary\b|quasi-primary|\bPrimary if\b|not citable as primary|P-adjacent/i.test(raw)) {
    return false;
  }
  if (/\[P\]|\[PRIMARY\]|\(\s*(?:[A-Za-z]+\s+)?primary\b[^)]*\)|\*Primary\.\*|\*\*\s*primary\b/i.test(raw)) return true;
  if (/\bPRIMARY\b/.test(raw)) return true; // upper-case label, e.g. "PRIMARY (regulator)."
  return null;
}

const EXCLUSIONS = [
  [/\bT4A\b|\bThe Fourth Angle\b/i, 'internal cross-reference to a T4A issue or brief'],
  [/\bpublished issue\b|^\W*Issue\s+\d{4}\b/i, 'internal cross-reference to a T4A issue'],
  [/src\/data\/|engine\/(?:briefs|output)|\binternal\]/i, 'internal workflow reference'],
  [/NEEDS VERIFICATION|\bor equivalent\b|\bTBD\b|\bTODO\b|to be confirmed|\bplaceholder\b/i, 'unverified placeholder'],
  [/\bEXCLUSION ONLY\b|LOGGED FOR EXCLUSION/i, 'logged for exclusion only'],
  [/\bnot yet (?:opened|pulled|read|retrieved|accessed)\b/i, 'listed but not yet consulted'],
];

/** Reason an entry must not be shown to readers, or null. */
export function exclusionReason(raw) {
  for (const [re, reason] of EXCLUSIONS) if (re.test(raw)) return reason;
  return null;
}

// ── URL handling ───────────────────────────────────────────────────────────

const URL_TOKEN = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>|`(https?:\/\/[^`]+)`|(https?:\/\/[^\s<>"`]+)/g;

function trimUrl(url) {
  let u = url;
  for (;;) {
    const last = u.slice(-1);
    if ('.,;:!?*_\'"]'.includes(last)) {
      u = u.slice(0, -1);
      continue;
    }
    if (last === ')') {
      const open = (u.match(/\(/g) || []).length;
      const close = (u.match(/\)/g) || []).length;
      if (close > open) {
        u = u.slice(0, -1);
        continue;
      }
    }
    return u;
  }
}

/** A URL we can link to as-is: not elided ("...") and not an API call with a key. */
function usableUrl(url) {
  return !/\.\.\.|…/.test(url) && !/[?&]api_key=|DEMO_KEY/i.test(url);
}

/**
 * Pull URLs out of a raw citation.
 * @returns {{ url: string|null, before: string, after: string }}
 *   url    — first usable URL, verbatim from the brief (trailing punctuation trimmed)
 *   before — text before the first URL token of any kind
 *   after  — text after that first URL token
 */
export function splitUrl(raw) {
  URL_TOKEN.lastIndex = 0;
  let first = null;
  let url = null;
  let m;
  while ((m = URL_TOKEN.exec(raw)) !== null) {
    const candidate = trimUrl(m[1] ?? m[2] ?? m[3] ?? m[4]);
    if (first === null) {
      // For bare URLs, the trimmed punctuation belongs to the surrounding text.
      const tokenLength = m[4] !== undefined ? candidate.length : m[0].length;
      first = { index: m.index, end: m.index + tokenLength };
    }
    if (url === null && usableUrl(candidate)) url = candidate;
  }
  if (first === null) return { url: null, before: raw, after: '' };
  return { url, before: raw.slice(0, first.index), after: raw.slice(first.end) };
}

// ── Cleaning ───────────────────────────────────────────────────────────────

/** Remove parenthetical groups whose content matches `test`, quote-aware. */
function removeParentheticals(text, test) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] !== '(') {
      out += text[i];
      i += 1;
      continue;
    }
    // Find the matching close paren, ignoring parens inside double quotes.
    let depth = 0;
    let inQuote = false;
    let j = i;
    for (; j < text.length; j++) {
      const c = text[j];
      if (c === '"') inQuote = !inQuote;
      else if (c === '“') inQuote = true;
      else if (c === '”') inQuote = false;
      else if (!inQuote && c === '(') depth += 1;
      else if (!inQuote && c === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    if (j >= text.length) {
      // Unbalanced: keep the rest as-is.
      out += text.slice(i);
      break;
    }
    const inner = text.slice(i + 1, j);
    if (test(inner)) out += ' ';
    else out += text.slice(i, j + 1);
    i = j + 1;
  }
  return out;
}

// Parentheticals that are working notes or the brief's own spectrum labels
// ("(PRIMARY)", "(GAP 2)", "(government-aligned)", "(mainstream / centrist)").
const ANNOTATION_PAREN =
  /\b(?:primary|secondary|403|opened|open manually|verif\w*|cross-reference|directionally|context only|GAP\s*\d|not citable|negative-finding|cited as such|used only|use only|Stage\s*\d|unverified|\w+-aligned|centrist|mainstream|independent|opposition|progressive|market-liberal|spectrum)\b/i;

const NOTE_SENTENCE =
  /\b(?:Note|NOTE|Sourcing note|independent check|verifier|opened this session|this session|do not use|treat as context|context only|not directly accessed|relied on|GAP\s*\d|Stage\s*[1-6]|UNVERIFIED|OPENED|Retrieval method|Cite as|confirm the absence|used only|use directionally|dropped from the cards|RELEVANT LAW|fetch attempt|request the)\b|✅|❌|⚠/;

/** Strip internal markers, IDs, evidence quotes and notes. Keeps emphasis marks. */
export function stripAnnotations(text) {
  let t = ` ${text} `;
  // Markers and IDs: **[P]** [S→P: company statement] [S, industry original] [PRIMARY] [S4] [S1 court decision] **S1**
  t = t.replace(/\*\*\s*\[[^\]]*\]\s*\*\*/g, ' ');
  t = t.replace(/\[(?:P|S)(?:\s*(?:→|->)\s*P)?(?:\s*[:,][^\]]*)?\]/g, ' ');
  t = t.replace(/\[(?:PRIMARY|P-adjacent)[^\]]*\]/gi, ' ');
  t = t.replace(/\[[A-Z]{1,2}\d{1,3}[a-z]?(?:\s[^\]]*)?\]/g, ' ');
  t = t.replace(/\*\*[A-Z]{1,2}\d{1,3}[a-z]?\*\*/g, ' ');
  // Verbatim evidence quotes: Quote: "..."  ·  Quote, reg. 7(1): "..."
  t = t.replace(/\bQuote\b[^"“]{0,40}["“][^"”]*["”]\.?/g, ' ');
  t = removeParentheticals(t, (inner) => /["“”]/.test(inner));
  // Annotation parentheticals: (PRIMARY) (GAP 2) (cross-reference only for timeline)
  t = removeParentheticals(t, (inner) => ANNOTATION_PAREN.test(inner) || /^\s*(?:international|regional|local)\s*$/i.test(inner));
  // Note sentences (before emphasis is stripped, so "**Stage 3:** ..." is still recognisable).
  const pieces = t.split(/(?<=[.;])\s+/);
  t = pieces.filter((p) => !NOTE_SENTENCE.test(p)).join(' ');
  // Emphasised annotations: *Primary.* *Secondary — use directionally only.* **PRIMARY (statute).**
  t = t.replace(
    /\*{1,2}\s*(?:Primary|Secondary|Commercial|PRC state-aligned|Named authority|Not yet|Text not yet|OPENED|Stage\s*\d|Academic \/ expert|Civil society|Parliamentary record)\b[^*]*\*{1,2}\.?/gi,
    ' ',
  );
  t = t.replace(/\bPRIMARY\s*\([^)]*\)\.?/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

/** Remove markdown emphasis and code marks, tidy separators at both ends. */
export function tidy(text) {
  if (!text) return '';
  let t = text
    .replace(/`/g, '')
    .replace(/\*+/g, '')
    .replace(/(^|[\s(])_+(?=\S)/g, '$1')
    .replace(/(?<=\S)_+(?=$|[\s),.;:])/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Gaps left by removed dates or notes: "press conference, , as reported" · "Bloomberg, — Greer"
  t = t.replace(/\s+,/g, ',').replace(/,(?:\s*,)+/g, ',').replace(/,\s*([—–])/g, ' $1');
  for (;;) {
    const before = t;
    t = t.replace(/^[\s,;:.—–\-(<]+/, '').replace(/[\s,;:—–\-(<]+$/, '');
    // A trailing period is citation punctuation, not content, except after an
    // abbreviation ("U.S.", "Sdn. Bhd.", "& Ors.").
    if (/\.$/.test(t) && !/(?:\b(?:[A-Za-z]\.){2,}|\b(?:Bhd|Sdn|Inc|Ltd|Co|No|St|Vol|pp|p|Ors|Anor|Jr|Sr)\.)$/.test(t)) {
      t = t.slice(0, -1);
    }
    if (t === before) break;
  }
  // Drop a dangling unmatched "(" or ")".
  const open = (t.match(/\(/g) || []).length;
  const close = (t.match(/\)/g) || []).length;
  if (open > close && /\([^)]*$/.test(t)) t = t.replace(/\s*\([^)]*$/, '').trim();
  if (close > open && /^[^(]*\)/.test(t)) t = t.replace(/^[^(]*?\)\s*/, '').trim();
  return t;
}

// ── Field extraction ───────────────────────────────────────────────────────

/** Looks like a short publisher name: few words, no digits, no comma. */
function publisherLike(text) {
  const t = tidy(text);
  if (!t || t.length > 40 || /\d|,/.test(t)) return false;
  return t.split(/\s+/).length <= 5;
}

/** Split "Left — right" at the first spaced em/en dash. */
function splitDash(text) {
  const m = /^(.+?)\s+[—–]\s+(.+)$/.exec(text);
  if (!m) return null;
  return { left: m[1], right: m[2] };
}

/** "Publisher — Title": left is a short name and right is not a bare domain or path. */
function dashIsPublisherTitle(dash) {
  return Boolean(dash) && publisherLike(dash.left) && !/^[\w.-]+\.(?:gov|com|org|net|edu|my|sg|io|info)\b/i.test(tidy(dash.right));
}

/** Pull a trailing date off the end of a title: "Media statement, 14 May 2026". */
function splitTrailingDate(text) {
  const m = new RegExp(`^(.*?)([\\s,(]+)(${DATE_ANY.source})\\)?\\s*$`).exec(text);
  if (!m?.[1].trim()) return null;
  // A bare year after a space is usually part of the title ("Road Safety Profile 2025",
  // "Amendment Act 2024", "torn down since 1957"); only ", 2026" or "(2026)" is a date.
  if (!/[A-Za-z]/.test(m[3]) && !/[,(]/.test(m[2])) return null;
  // "retrieved 7 Nov 2026" is when the brief author looked, not a publication date.
  if (/\b(?:retrieved|accessed|downloaded|as at|as of|reprint)\s*$/i.test(m[1])) return null;
  // "remarks of 21 Aug 2026", "tabled March 2024": the date is part of the phrase.
  if (/(?:\b(?:of|on|in|from|since|by|until|to|tabled|published|released|issued|dated|updated|filed|made|signed|enacted)|[/&])\s*$/i.test(m[1])) {
    return null;
  }
  return { rest: m[1], date: m[3] };
}

/** "Description (Publisher, Date)" — the e-wallet brief style. */
function splitTrailingParen(text) {
  const m = /^(.+?)\s*\(([^()]+)\)\s*$/.exec(text);
  if (!m) return null;
  const inner = m[2].trim();
  if (isOnlyDate(inner)) return { title: m[1], publisher: null, date: inner };
  // A generic attribution is kept as the publisher so the caller can drop the entry.
  if (/^(?:multiple|various|several)\b/i.test(inner)) return { title: m[1], publisher: inner, date: null };
  const comma = inner.lastIndexOf(',');
  if (comma > 0) {
    const tail = inner.slice(comma + 1).trim();
    if (isOnlyDate(tail)) return { title: m[1], publisher: inner.slice(0, comma), date: tail };
  }
  // A named outlet: capitalised, short, at most one comma ("RinggitPlus, VulcanPost").
  // Rules out "(official)", "(criminal appellate jurisdiction ...)", judges and court
  // panels, and records whose own text is already dated ("decision, 6 March 2024 (...)").
  const dated = DATE_PATTERNS.slice(0, 3).some((re) => re.test(m[1]));
  if (
    !dated &&
    !/presiding|\bchair\b|\bJCA\b|\bFCJ\b|\bCJ\b|judge/i.test(inner) &&
    /^[A-Z]/.test(inner) &&
    !/[\d;:]/.test(inner) &&
    inner.length >= 4 &&
    inner.length <= 60 &&
    inner.split(/\s+/).length <= 8 &&
    (inner.match(/,/g) || []).length <= 1
  ) {
    return { title: m[1], publisher: inner, date: null };
  }
  return null;
}

/**
 * Date that belongs to the citation itself, from the text right after the
 * title: up to the first dash, semicolon or full stop. A bare year counts only
 * when it opens that segment (", 2019–2020."), so "(inserted by Act 1995)" or
 * "citing a 2007 reply" do not become the source's date.
 */
function citationDate(rest) {
  if (!rest) return null;
  const cut = /\s[—–]\s|;\s|\.\s+(?=[A-Z])/.exec(rest);
  const segment = cut ? rest.slice(0, cut.index) : rest;
  for (const re of DATE_PATTERNS.slice(0, -1)) {
    const m = re.exec(segment);
    if (m) return m[0];
  }
  const year = /^[\s,.(]*((?:19|20)\d{2}(?:\s*[–-]\s*(?:19|20)?\d{2})?)\b/.exec(segment);
  return year ? year[1] : null;
}

// Words that introduce a quoted title rather than a quoted remark.
const TITLE_INTRO = /(?:^|[\s(])(?:release|report|statement|article|column|op-ed|paper|titled|entitled|interview|piece|brief|notice|advisory|speech|press release|fact sheet|factsheet|editorial|commentary|study|survey|dataset|page|post)\s*$/i;

/**
 * First "..." / “...” span that reads as a title: it opens the citation or
 * follows a separator (, — : ( *) or a word such as "release" or "report".
 * A quoted remark inside a description ("allege MACC "harassment"") is not a title.
 */
function findQuoted(text) {
  const re = /"([^"]{3,})"|“([^”]{3,})”/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(0, m.index).replace(/\s+$/, '');
    const prev = before.slice(-1);
    if (before === '' || ',—–:-(*'.includes(prev) || TITLE_INTRO.test(before)) {
      return { title: m[1] ?? m[2], start: m.index, end: m.index + m[0].length };
    }
  }
  return null;
}

/** First *italic* or **bold** span that starts near the beginning. */
function findEmphasised(text) {
  const re = /\*\*([^*]{3,}?)\*\*|(?<![*\w])\*([^*\s][^*]{1,}?)\*(?![*\w])|(?<![\w_])_([^_\s][^_]{1,}?)_(?![\w_])/g;
  const m = re.exec(text);
  if (!m || m.index > 120) return null;
  return { title: m[1] ?? m[2] ?? m[3], start: m.index, end: m.index + m[0].length };
}

/**
 * Cut a long fallback title to its citation core: before "Title: details",
 * before "; pinpoints", at the end of its first full sentence, and without a
 * long trailing description in parentheses.
 */
function trimFallbackTitle(text) {
  // Long asides in parentheses are working notes, not part of the citation.
  let t = removeParentheticals(text, (inner) => inner.length >= 60);
  t = t.replace(/\s+([,.;])/g, '$1').replace(/\s+/g, ' ');
  const colon = indexOutsideParens(t, ': ');
  if (colon >= 15) t = t.slice(0, colon);
  const semi = indexOutsideParens(t, '; ');
  if (semi >= 20) t = t.slice(0, semi);
  const sentence = /\.\s+(?=[A-Z(])/g;
  let s;
  while ((s = sentence.exec(t)) !== null) {
    if (s.index >= 20) {
      t = t.slice(0, s.index);
      break;
    }
  }
  const paren = /^(.{15,}?)\s*\(([^()]{40,})\)\s*\.?$/.exec(t);
  if (paren) t = paren[1];
  return t;
}

/** Index of `token` at parenthesis depth 0, or -1. */
function indexOutsideParens(text, token) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(') depth += 1;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (depth === 0 && text.startsWith(token, i)) return i;
  }
  return -1;
}

/** Keep only the last clause of an over-long publisher ("... Peer-reviewed: A & B" → "A & B"). */
function trimPublisher(text) {
  const t = tidy(text);
  if (t.length <= 80) return t;
  const cut = Math.max(t.lastIndexOf('. '), t.lastIndexOf(': '));
  return cut > 0 && t.length - cut > 4 ? tidy(t.slice(cut + 2)) : t;
}

/**
 * Extract { title, publisher, date, url } from one citation (already split
 * into a single source, markers and all).
 */
export function parseCitation(raw) {
  const { url, before, after } = splitUrl(raw);
  let text = stripAnnotations(before);
  // Label right before the URL: "... retrieved 7 Nov 2026. Browser view (no key needed):"
  text = text.replace(/(?<=[.;])\s+[^.;]{1,60}:\s*$/, '').trim();
  if (tidy(text).length < 3) text = stripAnnotations(after);

  let title = null;
  let publisher = null;
  let date = null;
  let rest = '';

  const quoted = findQuoted(text);
  const emphasised = findEmphasised(text);
  // A citation that opens with an emphasised span uses it as the title, unless
  // the quoted title sits inside that span (**Regjeringen.no — "Title"**).
  const leadEmphasis =
    emphasised && !tidy(text.slice(0, emphasised.start)) && !(quoted && quoted.start < emphasised.end)
      ? emphasised
      : null;
  if (leadEmphasis) {
    title = leadEmphasis.title;
    publisher = '';
    rest = text.slice(leadEmphasis.end);
    const dash = /^\s*[—–]\s+(.+)$/.exec(rest);
    const inner = splitDash(title);
    // A second quoted or emphasised span right after the lead one is the title.
    const after = rest.replace(/^[\s,:—–-]+/, '');
    const offset = rest.length - after.length;
    const next = /^"([^"]{3,})"|^“([^”]{3,})”|^\*\*([^*]{3,}?)\*\*|^\*([^*\s][^*]+?)\*(?![*\w])/.exec(after);
    if (next && publisherLike(title)) {
      // **Bernama**, "Bill to set up ...", 7 April 2026  ·  **The Star** — *Speaker to decide ...*, 17 May 2026
      publisher = title;
      title = next[1] ?? next[2] ?? next[3] ?? next[4];
      rest = rest.slice(offset + next[0].length);
    } else if (dash && dashIsPublisherTitle({ left: title, right: dash[1] })) {
      // **Bernama** — MACC to file appeal: the bold part is the publisher.
      publisher = title;
      title = trimFallbackTitle(dash[1]);
      rest = '';
    } else if (dash && publisherLike(dash[1]) && !publisherLike(title)) {
      // *Malaysia's Anti-hopping Law: Some Loopholes to Mull Over* — Fulcrum (ISEAS).
      publisher = dash[1];
      rest = '';
    } else if (dashIsPublisherTitle(inner)) {
      // **DEKSA — Directorate for Export Control and Sanctions**
      publisher = inner.left;
      title = inner.right;
    }
  } else if (quoted) {
    title = quoted.title;
    publisher = text.slice(0, quoted.start);
    rest = text.slice(quoted.end);
  } else if (emphasised) {
    // PLANMalaysia (KPKT), *Garis Panduan Perancangan Pusat Data*, 2024
    title = emphasised.title;
    publisher = text.slice(0, emphasised.start);
    rest = text.slice(emphasised.end);
  } else {
    const plain = tidy(text);
    const colon = /^([^:,]{2,40}):\s+(.+)$/.exec(plain);
    const dash = splitDash(plain);
    const paren = splitTrailingParen(plain);
    if (colon && publisherLike(colon[1])) {
      // Sinar Daily: Who was Amirul Hafiz Omar
      publisher = colon[1];
      title = colon[2];
    } else if (paren?.publisher) {
      // PDPA 2025 amendments — phases 1-3 (Chambers and Partners, 2026)
      ({ title, publisher, date } = paren);
    } else if (dashIsPublisherTitle(dash)) {
      // Parliament of Malaysia — official Bills portal for Dewan Rakyat
      publisher = dash.left;
      title = trimFallbackTitle(dash.right);
    } else if (dash) {
      // Document title — usage note
      title = trimFallbackTitle(dash.left);
    } else if (paren) {
      // Home Ministry data on fraud losses (Malay Mail, Jan 2026)
      ({ title, publisher, date } = paren);
    } else {
      title = trimFallbackTitle(plain);
    }
  }

  title = tidy(title);
  publisher = trimPublisher(publisher) || null;

  if (!date) date = citationDate(rest);
  if (!date && publisher) {
    const fromPublisher = findDate(publisher);
    if (fromPublisher) {
      date = fromPublisher.date;
      publisher = tidy(publisher.replace(fromPublisher.date, ' ')) || null;
    }
  }
  if (!date && !quoted) {
    const trailing = splitTrailingDate(title);
    if (trailing) {
      title = tidy(trailing.rest);
      date = trailing.date;
    }
  }
  return { title, publisher, date: date ? tidy(date) : null, url };
}

const SMALL_WORD = /^(?:of|in|and|the|on|for|to|at|by|via|de|di|dan|&|[—–-])$/i;

/**
 * Is a group label ("EIA, Today in Energy:", "OFAC:") a publisher name, as
 * opposed to an editorial category ("War and blockade:", "Victim-route record:")?
 * Publisher names are title-case or acronyms throughout.
 */
function isPublisherName(label) {
  const words = label.split(/[\s,]+/).filter(Boolean);
  return words.length > 0 && words.length <= 6 && words.every((w) => SMALL_WORD.test(w) || /^[A-Z0-9(“"']/.test(w));
}

/** Attach the group label of an "(a) / (b)" entry to a part that lacks a publisher. */
function applyGroupLabel(parsed, groupLabel) {
  if (parsed.publisher || !groupLabel) return parsed;
  if (isPublisherName(groupLabel)) return { ...parsed, publisher: groupLabel };
  // A bare identifier ("jy2469") reads better with its category; an outlet name does not.
  if (!publisherLike(parsed.title) && parsed.title.split(/\s+/).length <= 3) {
    return { ...parsed, title: `${groupLabel}: ${parsed.title}` };
  }
  return parsed;
}

// ── Sub-entries "(a) ... (b) ..." ──────────────────────────────────────────

/** Split "Group: (a) one ... (b) two ..." into a group label and parts. */
export function splitParts(raw) {
  const re = /(^|[\s:;*])\(([a-h])\)(?:\*\*)?\s+/g;
  const marks = [];
  let expected = 'a';
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m[2] !== expected) continue;
    marks.push({ letter: m[2], start: m.index + m[1].length, bodyStart: m.index + m[0].length });
    expected = String.fromCharCode(expected.charCodeAt(0) + 1);
  }
  if (marks.length < 2) return null;
  const parts = marks.map((mark, i) => ({
    letter: mark.letter,
    text: raw.slice(mark.bodyStart, i + 1 < marks.length ? marks[i + 1].start : raw.length),
  }));
  return { prefix: raw.slice(0, marks[0].start), parts };
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Parse a brief's SOURCES section(s).
 * @param {string} markdown
 * @returns {{
 *   status: 'ok' | 'empty' | 'missing' | 'planned',
 *   entries: { ref: string, title: string, publisher: string|null, date: string|null, url: string|null, primary: boolean }[],
 *   excluded: { ref: string, reason: string }[],
 * }}
 */
export function parseBriefSources(markdown) {
  const sections = findSourcesSections(markdown);
  if (sections.length === 0) return { status: 'missing', entries: [], excluded: [] };
  if (sections.every((s) => s.planned)) return { status: 'planned', entries: [], excluded: [] };

  const entries = [];
  const excluded = [];
  let seq = 0;
  for (const section of sections) {
    if (section.planned) continue;
    for (const rawEntry of collectRawEntries(section.lines)) {
      seq += 1;
      const ref = rawEntry.ref ?? `b${seq}`;
      const raw = rawEntry.text.trim();
      if (rawEntry.sectionInternal) {
        excluded.push({ ref, reason: 'internal cross-reference to a T4A issue' });
        continue;
      }
      const reason = exclusionReason(raw);
      if (reason) {
        excluded.push({ ref, reason });
        continue;
      }
      const split = splitParts(raw);
      const groupPrimary = split ? explicitPrimary(split.prefix) : null;
      const units = split
        ? split.parts.map((p) => ({ ref: `${ref}${p.letter}`, text: p.text, group: split.prefix }))
        : [{ ref, text: raw, group: null }];
      const groupLabel = split ? tidy(stripAnnotations(split.prefix)) || null : null;
      for (const unit of units) {
        const partReason = exclusionReason(unit.text);
        if (partReason) {
          excluded.push({ ref: unit.ref, reason: partReason });
          continue;
        }
        const own = explicitPrimary(unit.text);
        const primary = own ?? (split ? groupPrimary : null) ?? rawEntry.sectionPrimary;
        const parsed = applyGroupLabel(parseCitation(unit.text), groupLabel);
        if (!parsed.title || parsed.title.length < 2) {
          excluded.push({ ref: unit.ref, reason: 'no citable title' });
          continue;
        }
        if (parsed.publisher && /^(?:multiple|various|several)\b/i.test(parsed.publisher)) {
          excluded.push({ ref: unit.ref, reason: 'no citable publisher' });
          continue;
        }
        entries.push({ ref: unit.ref, ...parsed, primary: primary === true });
      }
    }
  }
  return { status: entries.length > 0 ? 'ok' : 'empty', entries, excluded };
}

/**
 * Fallback for issues whose only source record is the `sources` string in
 * src/data/issues/{id}.json ("Bernama 18 Apr 2026; Malay Mail 18 Apr 2026").
 * Each semicolon-separated item becomes one entry, verbatim. No primary flag:
 * the string carries no classification.
 */
export function parseSourcesField(value) {
  if (typeof value !== 'string') return [];
  return value
    .split(';')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 2)
    .map((s, i) => ({ ref: `s${i + 1}`, title: s, publisher: null, date: null, url: null, primary: false }));
}
