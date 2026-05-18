/**
 * Dossier loader
 * --------------------------------------------------------------
 * Aggregates every JSON file in src/data/dossiers/ into a typed
 * array of Dossier objects, using Vite's `import.meta.glob` so
 * the bundling is build-time (matches the pattern in
 * src/data/issues.ts — keep them parallel).
 *
 * Public API:
 *
 *   getAllDossiers(): Dossier[]          — all dossiers, newest first
 *   getDossierById(id): Dossier | null   — exact id match ('D001')
 *   getDossierBySlug(slug): Dossier | null
 *   getDossiersInSeries(seriesId): Dossier[]   — ordinal-sorted
 *
 * The route src/pages/dossier/[id].astro uses getStaticPaths over
 * getAllDossiers() so every published dossier builds to a static page.
 * --------------------------------------------------------------
 */

import type { Dossier } from './dossier-types';

// Eager glob — these are JSON files, small, embedded at build.
const modules = import.meta.glob<{ default: Dossier }>('./dossiers/*.json', {
  eager: true,
});

const ALL: Dossier[] = Object.values(modules)
  .map((m) => m.default)
  .filter((d): d is Dossier => Boolean(d && d.id && d.format === 'dossier'));

// Newest first by sourceDate. Stable tiebreak on id descending.
ALL.sort((a, b) => {
  const ad = Date.parse(a.sourceDate);
  const bd = Date.parse(b.sourceDate);
  if (ad !== bd) return bd - ad;
  return b.id.localeCompare(a.id);
});

export function getAllDossiers(): Dossier[] {
  return ALL.filter((d) => d.published);
}

/** Includes unpublished — used by validators and preview tooling only. */
export function getAllDossiersIncludingDrafts(): Dossier[] {
  return [...ALL];
}

export function getDossierById(id: string): Dossier | null {
  return ALL.find((d) => d.id === id) ?? null;
}

export function getDossierBySlug(slug: string): Dossier | null {
  return ALL.find((d) => d.slug === slug) ?? null;
}

export function getDossiersInSeries(seriesId: string): Dossier[] {
  return ALL.filter((d) => d.series.id === seriesId).sort(
    (a, b) => a.series.ordinal - b.series.ordinal
  );
}

/* ----------------------------------------------------------------
 * Feed integration — flag-gated soft-launch
 *
 * Q3/Q5 brief: dossiers exist at /dossier/[id] from day one, but are
 * NOT promoted in the homepage feed for the soak period. Flip
 * SHOW_DOSSIERS_IN_FEED to true to wide-launch — no rebuild required
 * if you do it through an env var instead. See FeedRow.svelte for
 * the corresponding render path.
 * ---------------------------------------------------------------- */

export const SHOW_DOSSIERS_IN_FEED: boolean = true;

/** A minimal projection for the feed row. Keep aligned with whatever
 *  shape FeedRow.svelte currently consumes for an Issue — augment
 *  rather than replace. */
export interface DossierFeedEntry {
  kind: 'dossier';
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  estReadMinutes: number;
  series: { id: string; name: string; ordinal: number };
  sourceDate: string;
  href: string; // canonical reader URL
  accentColor: string;
  primaryLens: string;
}

export function getDossierFeedEntries(): DossierFeedEntry[] {
  if (!SHOW_DOSSIERS_IN_FEED) return [];
  return getAllDossiers().map((d) => ({
    kind: 'dossier' as const,
    id: d.id,
    slug: d.slug,
    title: d.title,
    subtitle: d.subtitle,
    estReadMinutes: d.estReadMinutes,
    series: d.series,
    sourceDate: d.sourceDate,
    href: `/dossier/${d.id}`,
    accentColor: d.accentColor,
    primaryLens: d.primaryLens,
  }));
}
