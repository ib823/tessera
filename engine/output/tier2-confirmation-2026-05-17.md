# Tier 2 Resolution Confirmation — 2026-05-17

For each Tier 2 issue (low Stage 3 confidence), checks whether the currently-published cards substantially incorporate the Stage 3 critique. Primary signal is the Stage 6 synthesis revision log; fallback is a token check against pre-correction quotes.

| ID | Resolution | Notes |
|---|---|---|
| 1043 | RESOLVED | Stage 6 synthesis logged 8 revisions (8 explicit); ≥60% of 8 flagged |
| 1146 | RESOLVED | Stage 6 synthesis logged 13 revisions (13 untagged); ≥60% of 9 flagged |
| 1871 | RESOLVED | Stage 6 synthesis logged 26 revisions (26 explicit); ≥60% of 11 flagged |
| 1887 | RESOLVED | Stage 6 synthesis logged 8 revisions (8 untagged); ≥60% of 11 flagged |
| 1958 | RESOLVED | Stage 6 synthesis logged 4 revisions (4 explicit); ≥60% of 2 flagged |
| 1960 | RESOLVED | Stage 6 synthesis logged 6 revisions (6 explicit); ≥60% of 8 flagged |
| 1961 | RESOLVED | Stage 6 synthesis logged 9 revisions (9 explicit); ≥60% of 2 flagged |
| 1962 | STUB | Stage 3 has FAS=72 but no actionable claims/corrections — no audit signal; Stage 6 synthesis logged 11 revision(s) |
| 1963 | STUB | Stage 3 has FAS=74 but no actionable claims/corrections — no audit signal; Stage 6 synthesis logged 10 revision(s) |
| 1964 | RESOLVED | Stage 6 synthesis logged 7 revisions (7 explicit); ≥60% of 1 flagged |
| 1965 | RESOLVED | Stage 6 synthesis logged 11 revisions (11 explicit); ≥60% of 5 flagged |
| 1966 | RESOLVED | Stage 6 synthesis logged 8 revisions (8 explicit); ≥60% of 3 flagged |
| 1967 | RESOLVED | Stage 6 synthesis logged 8 revisions (8 explicit); ≥60% of 5 flagged |
| 1970 | RESOLVED | Stage 6 synthesis logged 8 revisions (8 explicit); ≥60% of 8 flagged |
| 1971 | RESOLVED | Stage 6 synthesis logged 7 revisions (7 explicit); ≥60% of 6 flagged |
| 1972 | RESOLVED | Stage 6 synthesis logged 5 revisions (5 explicit); ≥60% of 6 flagged |
| 1973 | STUB | Stage 3 has FAS=66 but no actionable claims/corrections — no audit signal; Stage 6 synthesis logged 8 revision(s) |
| 1974 | STUB | Stage 3 has FAS=61 but no actionable claims/corrections — no audit signal; Stage 6 synthesis logged 8 revision(s) |
| 1975 | RESOLVED | Stage 6 synthesis logged 9 revisions (8 explicit + 1 untagged); ≥60% of 9 flagged |
| 1977 | RESOLVED | Stage 6 synthesis logged 15 revisions (15 explicit); ≥60% of 10 flagged |
| 1978 | RESOLVED | Stage 6 synthesis logged 10 revisions (10 explicit); ≥60% of 6 flagged |
| 1979 | RESOLVED | Stage 6 synthesis logged 8 revisions (8 explicit); ≥60% of 10 flagged |
| 1980 | RESOLVED | Stage 6 synthesis logged 8 revisions (6 explicit + 2 untagged); ≥60% of 7 flagged |
| 1983 | RESOLVED | Stage 6 synthesis logged 18 revisions (18 explicit); ≥60% of 10 flagged |
| 1987 | RESOLVED | Stage 6 synthesis logged 11 revisions (11 explicit); ≥60% of 12 flagged |
| 1988 | RESOLVED | Stage 6 synthesis logged 7 revisions (7 explicit); ≥60% of 6 flagged |

## Summary

| Status | Count |
|---|---:|
| RESOLVED | 22 |
| PARTIAL | 0 |
| UNRESOLVED | 0 |
| STUB (no actionable Stage 3) | 4 |

## Interpretation

Resolution is determined primarily from revision entries in the Stage 6 synthesis (`revision_log`, `revisions`, `revisions_applied`, or inline card `notes`). Explicit Stage 3 attribution is the strongest signal; bare correction verbs without stage labels are treated as a weaker proxy since Stage 3 is the dominant source of factual corrections in the active pipeline (Stages 4 and 5 are retired).

When no synthesis is available, a fallback token-match against the pre-correction Stage 3 quotes is used. This is less reliable because corrected wording often shares tokens (numbers, named entities) with the original.

Use `node scripts/view-stage3.mjs <id>` to inspect the cross-reference between Stage 3 critique and current cards on any specific issue.