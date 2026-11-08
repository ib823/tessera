/**
 * Shared stealth term list.
 *
 * STEALTH_TERMS is the list scripts/stealth.mjs scans the built dist/ for.
 * Word-boundary patterns avoid false positives like "astronaut".
 *
 * The "astro" check also ignores "Astro Awani" / "Astro Malaysia" /
 * "Astro Holdings" / "Astro Berhad" — "Astro" is the parent name of the
 * Malaysian media group and is a legitimate editorial citation (e.g. dossier
 * source lists reference Astro Awani news coverage). The framework "Astro"
 * never appears followed by these tokens, so a single negative-lookahead
 * suffix is sufficient.
 *
 * Each regex carries the `g` flag because stealth.mjs counts matches; callers
 * that only test for presence should reset `lastIndex` or use `matchStealth`.
 */
export const STEALTH_TERMS = [
  // Framework identifiers
  { term: 'astro', regex: /\bastro\b(?!naut|nom|logy|phys|\s+(?:Awani|Malaysia|Holdings|Berhad|Group))/gi },
  { term: 'svelte', regex: /\bsvelte\b/gi },
  { term: 'vercel', regex: /\bvercel\b/gi },
  { term: 'thefourthangle.vercel', regex: /thefourthangle\.vercel/gi },
  // Identity traces
  { term: 'github', regex: /\bgithub\b/gi },
  { term: 'codespace', regex: /\bcodespace\b/gi },
  { term: 'ib823', regex: /ib823/gi },
  { term: 'fa-ops', regex: /fa-ops/gi },
  { term: 'fa-ops@proton', regex: /fa-ops@proton/gi },
  // AI/model references (editorial policy)
  { term: 'claude', regex: /\bclaude\b(?!\.md)/gi },
  { term: 'openai', regex: /\bopenai\b/gi },
  { term: 'chatgpt', regex: /\bchatgpt\b/gi },
  { term: 'gpt-4', regex: /\bgpt-4\b/gi },
  { term: 'anthropic', regex: /\banthropic\b/gi },
  { term: 'deepseek', regex: /\bdeepseek\b/gi },
  { term: 'gemini', regex: /\bgemini\b/gi },
  { term: 'language model', regex: /language model/gi },
  { term: 'LLM', regex: /\bLLM\b/g },
  // Local paths
  { term: '/workspaces/', regex: /\/workspaces\//gi },
  { term: '/home/codespace', regex: /\/home\/codespace/gi },
  { term: 'node_modules', regex: /node_modules/gi },
];

/**
 * Extra provider and methodology terms for reader-facing editorial data
 * (CLAUDE.md "Content Rules"). STEALTH_TERMS predates Grok and only matches
 * "gpt-4"; these close the gap for any GPT version, Grok, plural LLMs and
 * "AI model(s)". Bare "AI" and "model" stay allowed: published issues cover
 * AI data centres and AI chips as subject matter, and "business model" is
 * ordinary English (same reasoning as scripts/publish-pipeline.mjs).
 */
export const EDITORIAL_EXTRA_TERMS = [
  { term: 'gpt', regex: /\bGPT(?:-?\d[\w.]*)?\b/gi },
  { term: 'grok', regex: /\bgrok\b/gi },
  { term: 'LLMs', regex: /\bLLMs\b/g },
  { term: 'language models', regex: /\blanguage models\b/gi },
  { term: 'AI model', regex: /\bAI[- ]models?\b/gi },
  { term: 'AI-generated', regex: /\bAI[- ]generated\b/gi },
];

/** Terms that must never appear in reader-facing source lists. */
export const SOURCE_BANNED_TERMS = [...STEALTH_TERMS, ...EDITORIAL_EXTRA_TERMS];

/**
 * Return the list of banned terms found in `text` (empty when clean).
 * @param {string} text
 * @param {{term: string, regex: RegExp}[]} [terms]
 * @returns {string[]}
 */
export function matchStealth(text, terms = SOURCE_BANNED_TERMS) {
  const hits = [];
  for (const { term, regex } of terms) {
    regex.lastIndex = 0;
    if (regex.test(text)) hits.push(term);
    regex.lastIndex = 0;
  }
  return hits;
}
