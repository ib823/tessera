/**
 * Dossier — type definitions
 * --------------------------------------------------------------
 * Mirrors the JSON shape in src/data/dossiers/*.json.
 *
 * The dossier is the long-form companion to the bite-size Issue
 * product. Sections are a typed, ordered array — the `t` field is
 * the discriminator. Reader components key off `t` and render the
 * appropriate Dossier* sub-component.
 *
 * If you add a new section type:
 *   1. Add a case here (interface + union member).
 *   2. Add a render arm in src/components/DossierReader.svelte.
 *   3. Add validation in scripts/validate-dossiers.mjs.
 * --------------------------------------------------------------
 */

/* -------------------- enums / primitives -------------------- */

export type DossierLens =
  | 'Political'
  | 'Economic'
  | 'Legal'
  | 'Regional'
  | 'Social'
  | 'Constitutional';

export type DossierStatus = 'new' | 'updated' | 'archived';

export type DossierFigureKind =
  | 'illustration-svg' // hand-drawn / externally generated
  | 'illustration-png' // external raster
  | 'timeline-svg' // code-rendered timeline
  | 'data-chart-svg' // code-rendered bar / line chart
  | 'concept-svg' // code-rendered conceptual diagram
  | 'comparison-table'; // semantic <table>, not SVG

/* -------------------- shared blocks -------------------- */

export interface DossierSeriesMeta {
  id: string; // slug, e.g. 'malaysia-political-mechanics'
  name: string; // display, e.g. 'Malaysia Political Mechanics'
  ordinal: number; // 1-indexed position within the series
}

export interface DossierFigure {
  id: string; // 'fig-1' | 'fig-cover' | ...
  kind: DossierFigureKind;
  src: string; // path relative to /public, e.g. '/dossiers/D001/fig-1.svg'
  title: string;
  alt: string; // a11y — required, never empty
  purpose?: string; // editorial note, not rendered
  caption?: string; // displayed below the figure (italic, body type)
  sourceLine?: string; // primary-source citation, displayed below caption
}

export interface DossierDesignTokens {
  accent: string;
  accentDim: string;
  background: string;
  bodyText: string;
  mutedText: string;
  ruleColor: string;
  fontBody: string;
  fontDisplay: string;
  fontUI: string;
  fontMono: string;
}

export interface DossierStageScores {
  pa: number; // Primary Analysis
  ba: number; // Bias Audit
  fc: number; // Fact Verification
  af?: number; // Alt-Framing
  ct?: number; // Contrarian
  sr: number; // Synthesis Review
}

/* -------------------- section types (discriminated union) -------------------- */

interface DossierSectionBase {
  id: string; // unique within the dossier; used as URL fragment
}

export interface DossierCoverSection extends DossierSectionBase {
  t: 'cover';
  title: string;
  subtitle: string;
  seriesMark: string; // 'Series 1 · Dossier 1 · Malaysia Political Mechanics'
  estReadMinutes: number;
  whatYoullLearn: string[];
  heroFigure: string; // figure id
}

export interface DossierTldrSection extends DossierSectionBase {
  t: 'tldr';
  title: string;
  bullets: string[];
}

export interface DossierChapterSection extends DossierSectionBase {
  t: 'chapter';
  n: number;
  title: string; // 'Part One'
  subtitle: string; // 'The Move'
}

export interface DossierConceptSection extends DossierSectionBase {
  t: 'concept';
  title: string;
  body: string;
  citations?: string[];
  figure?: string; // optional figure-id anchor (e.g. fig-4 on the pivotal-player concept)
}

export interface DossierFactSection extends DossierSectionBase {
  t: 'fact';
  lens: DossierLens;
  title: string;
  body: string;
  citations?: string[];
  figure?: string; // optional figure-id anchor (e.g. fig-5 on six-conditions)
}

export interface DossierTimelineEvent {
  year: string | number;
  label: string;
  founder: string;
  outcome: string;
}

export interface DossierTimelineSection extends DossierSectionBase {
  t: 'timeline';
  figure?: string; // figure id, optional
  title: string;
  intro: string;
  events: DossierTimelineEvent[];
}

export interface DossierCaseSection extends DossierSectionBase {
  t: 'case';
  title: string;
  body: string;
  citations?: string[];
  figure?: string;
}

export interface DossierReframeSection extends DossierSectionBase {
  t: 'reframe';
  body: string;
}

export interface DossierDiagramSection extends DossierSectionBase {
  t: 'diagram';
  figure: string; // figure id (required for diagram sections)
  title: string;
  body: string;
  citations?: string[];
}

export interface DossierQuoteSection extends DossierSectionBase {
  t: 'quote';
  source: string;
  body: string; // paraphrase / verbatim quote
  commentary?: string;
  editorNote?: string; // visible inline italic muted note (Article 49A pattern)
}

export interface DossierMistakeSection extends DossierSectionBase {
  t: 'mistake';
  claim: string; // the wrong belief, rendered with strike-through
  correction: string; // the corrective explanation
}

export interface DossierViewSection extends DossierSectionBase {
  t: 'view';
  body: string;
}

export interface DossierFurtherReadingItem {
  category: string;
  title: string;
  note: string;
}

export interface DossierFurtherReadingSection extends DossierSectionBase {
  t: 'further_reading';
  title: string;
  items: DossierFurtherReadingItem[];
}

export interface DossierCiteAsSection extends DossierSectionBase {
  t: 'cite_as';
  title: string;
  format: string; // the canonical citation string
  license: string;
}

export type DossierSection =
  | DossierCoverSection
  | DossierTldrSection
  | DossierChapterSection
  | DossierConceptSection
  | DossierFactSection
  | DossierTimelineSection
  | DossierCaseSection
  | DossierReframeSection
  | DossierDiagramSection
  | DossierQuoteSection
  | DossierMistakeSection
  | DossierViewSection
  | DossierFurtherReadingSection
  | DossierCiteAsSection;

export type DossierSectionType = DossierSection['t'];

/* -------------------- the dossier itself -------------------- */

export interface Dossier {
  id: string; // 'D001'
  format: 'dossier'; // discriminator vs Issue
  series: DossierSeriesMeta;
  title: string;
  subtitle: string;
  slug: string;
  estReadMinutes: number;
  wordCount: number;
  published: boolean;
  sourceDate: string; // ISO date — when the editorial pipeline completed
  edition: number;
  status: DossierStatus;
  primaryLens: DossierLens;
  ogImage: string; // '/dossiers/D001/og-1200x630.png'
  accentColor: string; // hex — falls back to designTokens.accent
  stageScores: DossierStageScores;
  stageScoresNote?: string;
  finalScore: number;
  finalScoreNote?: string;
  legacyAudit: boolean;
  relatedIssues: string[]; // issue IDs ('0142', '0173')
  citeAs: string;
  sections: DossierSection[];
  figures: DossierFigure[];
  designTokens: DossierDesignTokens;
}

/* -------------------- helpers -------------------- */

/** Type predicates for section narrowing in templates. */
export const isCover = (s: DossierSection): s is DossierCoverSection => s.t === 'cover';
export const isTldr = (s: DossierSection): s is DossierTldrSection => s.t === 'tldr';
export const isChapter = (s: DossierSection): s is DossierChapterSection => s.t === 'chapter';
export const isConcept = (s: DossierSection): s is DossierConceptSection => s.t === 'concept';
export const isFact = (s: DossierSection): s is DossierFactSection => s.t === 'fact';
export const isTimeline = (s: DossierSection): s is DossierTimelineSection => s.t === 'timeline';
export const isCase = (s: DossierSection): s is DossierCaseSection => s.t === 'case';
export const isReframe = (s: DossierSection): s is DossierReframeSection => s.t === 'reframe';
export const isDiagram = (s: DossierSection): s is DossierDiagramSection => s.t === 'diagram';
export const isQuote = (s: DossierSection): s is DossierQuoteSection => s.t === 'quote';
export const isMistake = (s: DossierSection): s is DossierMistakeSection => s.t === 'mistake';
export const isView = (s: DossierSection): s is DossierViewSection => s.t === 'view';
export const isFurtherReading = (s: DossierSection): s is DossierFurtherReadingSection =>
  s.t === 'further_reading';
export const isCiteAs = (s: DossierSection): s is DossierCiteAsSection => s.t === 'cite_as';

/** Section types that consume a figure id. Useful for the validator. */
export const SECTION_TYPES_WITH_FIGURE: DossierSectionType[] = [
  'cover',
  'timeline',
  'diagram',
  'concept',
  'fact',
  'case',
];

/** Section types that count toward the reader-progress denominator.
 *  Cover and cite_as are excluded because they're not "reading" sections. */
export const COUNTED_SECTION_TYPES: DossierSectionType[] = [
  'tldr',
  'chapter',
  'concept',
  'fact',
  'timeline',
  'case',
  'reframe',
  'diagram',
  'quote',
  'mistake',
  'view',
  'further_reading',
];

/** Helper for TOC grouping. Returns the chapter section before this one. */
export function chapterFor(sections: DossierSection[], index: number): DossierChapterSection | null {
  for (let i = index; i >= 0; i--) {
    const s = sections[i];
    if (s.t === 'chapter') return s;
  }
  return null;
}
