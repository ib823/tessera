# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review pass over `top-issues-to-develop.md` (radar scan 2026-05-30 03:36 UTC)._
_This is the `editorial review` step in the documented flow: `radar scan → issue-queue.json → top-issues-to-develop.md → editorial review → publish pipeline`. The radar does not write issues; this note recommends which candidates enter the 10-phase publish flow and in what order. Nothing here is published._

## Selection criteria applied
- **Editorial fit + composite score** (from radar).
- **3R load** (Race, Religion, Royalty) — critique policy, not communities; higher verification bar.
- **Stage 5 escalation triggers** (per CLAUDE.md / ADR-0004): re-enable Grok Contrarian when a brief marks Religion / Ethnic / Royalty risk HIGH+, marks Political risk CRITICAL with a sharp take, or when Stage 3 `source_diversity_estimate` < 0.4.
- **Overlap with already-published issues** — avoid duplication; differentiate the angle.
- **Lens diversity** across the next publish slots (Today page groups by primary lens).
- **Hook emotion** — favour anger-at-process / anxiety-of-precedent over sadness (Berger-Milkman).

## Per-candidate assessment

| # | Candidate | Score | Lens | 3R load | Stage 5? | Overlap | Notes |
|---|-----------|------:|------|---------|----------|---------|-------|
| 1 | Sabah MA63 40% revenue entitlement standoff | 0.87 | Governance | MEDIUM (Borneo rights / federal-state — frame as federalism, not ethnic) | **Candidate** — silence-driven, thin coverage; verify Stage 3 `source_diversity_estimate`, escalate if <0.4 | **HIGH** — `sabah-two-ma63-delays-akps-vs-40pc-revenue-stay` already published | Highest score, but must differentiate from the existing Sabah MA63 issue (new angle = the 40% revenue *stay/standoff* specifically). Silence signal = strong public-interest case. |
| 2 | Data Sharing Bill 2025 cross-agency access | 0.81 | Rights | LOW | No | None (`related_published` empty) | Cleanest pick: fresh, Rights-lens fit, high volume (88 GDELT/72h, 22 articles), Google Trends breakout = timely. Anxiety-of-precedent hook (scope creep on cross-agency access). |
| 3 | Flooding displacement vs flood-mitigation budget delay | 0.78 | Environmental | LOW | No | Check existing flood/mitigation issues | Strong anger-at-process angle (budget delay vs displacement). Good lens diversity. |
| 4 | KL water disruption + NRW non-revenue water | 0.74 | Governance | LOW | No | Check existing water/NRW issues | Evergreen governance; concrete denominators available (NRW %). |
| 5 | Teacher shortage data dispute | 0.71 | Social | LOW | No | — | Narrative-fragmentation pick; good for "competing numbers" reframe. |
| 6 | Allowance reform for frontline civil servants | 0.69 | Economic | LOW | No | — | Network-bridge signal; Economic lens. |
| 7 | Cabotage policy Sabah Sarawak shipping costs | 0.66 | Regional | MEDIUM-LOW (Borneo regional) | No | Thematic overlap with #1 (Borneo) | Sequence apart from #1 to avoid back-to-back Borneo framing. |
| 8 | Apprentice wage subsidy uptake shortfall | 0.61 | Economic | LOW | No | — | |
| 9 | PADU database adoption stall | 0.58 | Technology | LOW | No | Possible link to data/PADU issues | Pairs conceptually with #2 (data governance). |
| 10 | Cross-border haze enforcement gap | 0.55 | Environmental | LOW | No | — | Pairs with #3 thematically; sequence apart. |

## Recommended development order (next 3 publish slots — Tue/Thu/Sat)

1. **#2 Data Sharing Bill 2025** — cleanest fit, fresh, low 3R, timely (Trends breakout). Rights lens. Best first pick to ship cleanly through the full pipeline.
2. **#1 Sabah MA63 40% revenue standoff** — highest radar score, but requires (a) explicit differentiation from the already-published Sabah MA63 issue, (b) careful federal-state framing (not ethnic), and (c) a source-diversity check at Stage 3 — escalate to Stage 5 if `source_diversity_estimate` < 0.4. Governance lens.
3. **#3 Flooding vs mitigation budget delay** — strong anger-at-process hook, Environmental lens for spread.

This sequence balances lens diversity (Rights → Governance → Environmental) and spreads the two MEDIUM-3R / Borneo items (#1, #7) apart.

## Verification still pending (environment-limited this session)
- Live `grep` of `src/data/issues/` for overlap on #3, #4, #9 was not completed reliably (tool environment was dropping outputs). Confirm overlaps before drafting briefs.
- `source_diversity_estimate` for #1 is produced at Stage 3; gate the Stage 5 decision on it.

_Generated as an editorial-review companion to the radar scan; supersede on the next scan._
