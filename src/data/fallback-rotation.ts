/**
 * Fallback rotation pool — when no manual publishing happens
 * before a scheduled notification, the system publishes one of
 * these pre-selected sets (rotating weekly).
 *
 * All issues in this pool must have:
 * - One-line art image in public/og/backgrounds/issue-{id}-bg.png
 * - Content signatures in signatures.json
 * - Legal clearance confirmed
 * - PRIMARY-SOURCE-VERIFIED claims in every card (CLAUDE.md Accuracy Standard)
 *
 * Week selection: Math.ceil(dayOfMonth / 7) gives week 1-4
 *
 * STATUS (2026-05-17): The legacy FALLBACK pool of 40 issues was audited
 * against the gold-standard primary-source verification protocol in
 * CLAUDE.md. All 40 failed verification — every issue's load-bearing
 * specific quantitative claims were either untraceable to a primary source
 * or contradicted by official data (e.g. 1MDB 38% vs MACC's actual 74.5%,
 * Malaysia CPI 47→50 actually improved, MRT3 was openly tendered, Online
 * Safety Act has no "Digital Safety Commissioner" institution).
 *
 * Each failed issue is now `published: false`. The rotation is empty
 * until the pool is rebuilt with verified content. Audit briefs are in
 * engine/briefs/ (5 detailed Batch-1 briefs) and the agent reports for
 * the remaining 30 issues are summarised in the commit message.
 *
 * On a quiet week with no fresh publishing, the CRON Worker will find
 * nothing to publish — that is the intended behaviour until the pool is
 * verified, per CLAUDE.md: "drop the claim, soften the framing, or hold
 * the issue. Reputational damage from a single wrong number is greater
 * than the loss from one delayed publication."
 */

export const FALLBACK_WEEKS: string[][] = [
  // Week 1 (1st-7th of month) — empty pending verified rebuild
  [],

  // Week 2 (8th-14th) — empty pending verified rebuild
  [],

  // Week 3 (15th-21st) — empty pending verified rebuild
  [],

  // Week 4 (22nd-31st) — empty pending verified rebuild
  [],
];

export function getFallbackIssueIds(): string[] {
  const day = new Date().getDate();
  const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
  return FALLBACK_WEEKS[weekIndex];
}
