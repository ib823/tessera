# Tier 2 Resolution Confirmation — 2026-05-17

For each Tier 2 issue (low Stage 3 confidence), checks whether the currently-published cards substantially incorporate the Stage 3 critique. Issues with all corrections applied are marked RESOLVED — they remain in the audit Tier 2 list only because the Stage 3 file evaluates the pre-correction draft.

| ID | Resolution | Notes |
|---|---|---|
| 1043 | RESOLVED | Stage 6 synthesis tagged 8 Stage 3 corrections (≥60% of 8 flagged) |
| 1146 | PARTIAL | Token check: 2 of 9 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1871 | RESOLVED | Stage 6 synthesis tagged 26 Stage 3 corrections (≥60% of 11 flagged) |
| 1887 | UNRESOLVED | Token check: 5 of 11 flagged claims likely still in cards (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1958 | PARTIAL | Token check: 1 of 2 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1960 | PARTIAL | Token check: 2 of 8 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1961 | RESOLVED | Token check: all 2 flagged claims absent from current cards (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1962 | STUB | Stage 3 has FAS=72 but no actionable claims/corrections — no audit signal |
| 1963 | STUB | Stage 3 has FAS=74 but no actionable claims/corrections — no audit signal |
| 1964 | RESOLVED | Token check: all 1 flagged claims absent from current cards (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1965 | PARTIAL | Token check: 2 of 5 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1966 | RESOLVED | Token check: all 3 flagged claims absent from current cards (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1967 | RESOLVED | Stage 6 synthesis tagged 8 Stage 3 corrections (≥60% of 5 flagged) |
| 1970 | RESOLVED | Stage 6 synthesis tagged 8 Stage 3 corrections (≥60% of 8 flagged) |
| 1971 | RESOLVED | Stage 6 synthesis tagged 7 Stage 3 corrections (≥60% of 6 flagged) |
| 1972 | RESOLVED | Stage 6 synthesis tagged 5 Stage 3 corrections (≥60% of 6 flagged) |
| 1973 | STUB | Stage 3 has FAS=66 but no actionable claims/corrections — no audit signal |
| 1974 | STUB | Stage 3 has FAS=61 but no actionable claims/corrections — no audit signal |
| 1975 | PARTIAL | Token check: 3 of 9 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1977 | PARTIAL | Stage 6 synthesis tagged 5 of 10 Stage 3 corrections |
| 1978 | PARTIAL | Stage 6 synthesis tagged 3 of 6 Stage 3 corrections |
| 1979 | PARTIAL | Token check: 2 of 10 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1980 | PARTIAL | Token check: 2 of 7 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1983 | PARTIAL | Token check: 3 of 10 flagged claims may still be present (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1987 | UNRESOLVED | Token check: 6 of 12 flagged claims likely still in cards (Stage 6 synthesis has no tagged Stage 3 corrections) |
| 1988 | UNRESOLVED | Token check: 3 of 6 flagged claims likely still in cards (Stage 6 synthesis has no tagged Stage 3 corrections) |

## Summary

| Status | Count |
|---|---:|
| RESOLVED | 9 |
| PARTIAL | 10 |
| UNRESOLVED | 3 |
| STUB (no actionable Stage 3) | 4 |

## Interpretation

Resolution is determined primarily from Stage 6 synthesis tags (`CORRECTED (Stage 3)` and `REMOVED (Stage 3)` entries in `revision_log`). When no synthesis exists, a fallback token-match against the pre-correction Stage 3 quotes is used; this is less reliable because corrected wording often shares tokens (numbers, named entities) with the original.

Issues marked RESOLVED have a Stage 6 synthesis that explicitly tags ≥60% of the Stage 3 critique items as corrected or removed. PARTIAL and UNRESOLVED are the genuine remaining editorial debt — start with `node scripts/view-stage3.mjs <id>` to inspect each.