/**
 * Fallback rotation pool — when no manual publishing happens
 * before a scheduled notification, the system publishes one of
 * these pre-selected sets (rotating weekly).
 *
 * All 40 issues must have:
 * - One-line art image in public/og/backgrounds/issue-{id}-bg.png
 * - Content signatures in signatures.json
 * - Legal clearance confirmed
 *
 * Week selection: Math.ceil(dayOfMonth / 7) gives week 1-4
 */

export const FALLBACK_WEEKS: string[][] = [
  // Week 1 (1st-7th of month)
  // 1581 removed 2026-05-17: cardinal-sin verification failure (340-family /
  // RM82M audit breakdown / 1.1B L claim contradicts 1.89B L design). Unpublished.
  // See engine/briefs/orang-asli-kelau-dam-resettlement.md.
  ["1074", "1239", "1288", "1389", "1606", "1120", "1315", "1511", "1653"],

  // Week 2 (8th-14th)
  // 1170 removed 2026-05-17: cardinal-sin verification failure (7/7
  // quantitative claims untraceable to primary source). Unpublished.
  // See engine/briefs/bumiputera-contract-quota-ali-baba.md.
  // 1262 removed 2026-05-17: "4,200 families" headline number untraceable.
  // See engine/briefs/syariah-civil-jurisdiction-clash.md.
  ["0154", "1067", "1471", "1604", "1675", "0179", "1049", "1227"],

  // Week 3 (15th-21st)
  // 1641 removed 2026-05-17: 2.1%/5.4% claim does not reconcile with verified
  // budget data (RM50M / RM82B ≠ 2.1%). Unpublished.
  // See engine/briefs/tamil-schools-budget-allocation.md.
  ["1283", "1401", "1520", "1564", "1950", "0142", "0150", "0165", "1018"],

  // Week 4 (22nd-31st)
  // 1549 removed 2026-05-17: "200/87 days/8 charged" 2025 specifics
  // untraceable. See engine/briefs/orang-asli-royal-belum-blockade.md.
  ["1100", "1165", "1248", "1327", "1364", "1435", "1603", "1662", "1879"],
];

export function getFallbackIssueIds(): string[] {
  const day = new Date().getDate();
  const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
  return FALLBACK_WEEKS[weekIndex];
}
