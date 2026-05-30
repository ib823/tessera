# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review companion to the radar's curated develop list
(`radar/output/top-issues-to-develop.md`). This is the `editorial review`
step in the documented flow: `radar scan → issue-queue.json +
silence-watch.md → top-issues-to-develop.md → editorial review → publish
pipeline`. The radar does not write issues; this note recommends which
curated candidates enter the 10-phase publish flow, in what order, and
with what guardrails. Nothing here is published._

## Data-freshness warning (read first)

- The **raw queue** (`issue-queue.json`) was rescanned **2026-05-30 03:36 UTC**.
- The **curated develop list** (`top-issues-to-develop.md`) is still dated
  **2026-05-17** and states "Latest published ID: 1991". The repository is
  now at **issue 2000** (commit `9d0d58c`). So issues **1992–2000 were
  published after the curated list was written** and are NOT reflected in it.
- **Action before developing any pick below:** re-confirm it has not already
  been published in 1992–2000, and re-run the curator against the 2026-05-30
  queue. Treat the Tier A/B picks here as the most recent *curated* candidates,
  not as a guaranteed-fresh list.
- The top of the raw 2026-05-30 queue is dominated by silence-anomaly **stubs**
  ("budget 2027 presentation", "parliament second session opens", "malay",
  "federal", "police", "pas", "umno"). Per the curated file's own methodology
  notes these are attention noise-floors, **not developable issues** — rank
  order is not develop order.

## Selection criteria applied
- **Editorial leverage** (curated file's ordering), not raw radar score.
- **3R load** (Race, Religion, Royalty) — critique policy, not communities; the
  verification bar is *higher* for 3R-adjacent claims.
- **Stage 5 escalation** (CLAUDE.md / ADR-0004): re-enable the Grok Contrarian
  stress-test when a brief marks Religion / Ethnic / Royalty risk HIGH+, marks
  Political risk CRITICAL with a sharp take, or when Stage 3
  `source_diversity_estimate` < 0.4.
- **In-flight status** — do not re-develop something already under `engine/briefs/`.
- **Lens diversity** across the next publish slots.

## Tier A assessment (from `top-issues-to-develop.md`, 2026-05-17)

| Pick | Topic | Lenses | 3R load | Stage 5? | In-flight brief? | Notes |
|------|-------|--------|---------|----------|------------------|-------|
| A1 | Federal Court stay on Isa Samad corruption conviction set-aside | Legal, Governance, Historical | None material (court record) | No | None on file | Clean public-record legal story. Pairs via `related[]` with 1990 (Rafizi RM1.1B) and A3 for the corruption-accountability arc. |
| A2 | Penang Islamic Dept halts Chinese temple's open house | Rights, Legal, Religious | **HIGH (ethnic + religious)** | **Yes — re-enable Stage 5** | None on file | Highest-bar 3R. Source the JHEAIPP letter directly, two independent primary sources per specific, or hold. Critique jurisdictional reach, not the faith. |
| A3 | Federal agency CEO arrested over RM1m bribe (squash-court project) | Governance, Economic, Legal | None | No | None on file | Charges filed = low defamation risk. Pairs with A1. |
| A4 | Court of Appeal upholds Bersatu termination of Suhaili (Art. 49A) | Legal, Political, Historical | None material | No | **Yes — `engine/briefs/suhaili-bersatu-coa-article-49a.md` + a `…-verification-needed.md` note** | Already in flight with an OPEN verification flag. Resolve the verification-needed items, do not re-develop from scratch. |
| A5 | PDRM CCID: investment-fraud losses RM1.47B in 2025 | Economic, Governance, Social | None | No | None on file | Denominator-rich "scam economy" piece. Frame as systemic-capacity gap (SC enforcement bandwidth vs CCID case volume), not moral panic. |

Tier B carries border-agency arming (B1), KKM cost-saving under the
expenditure freeze (B2), Terengganu oil-spill EQA enforcement (B3),
Malaysia–West Asia trade −30.4% (B4), and the ILO/Bestinet correction
(B5, has a prior-issue `related[]` hook ready). Develop these only if Tier A
is blocked.

## Recommended development order (next 3 publish slots — Tue/Thu/Sat)

1. **A1 — Isa Samad Federal Court stay.** Cleanest first pick: public court
   record, low 3R, strong arc pairing. Legal lens.
2. **A5 — PDRM CCID RM1.47B fraud.** Denominator-friendly, low 3R, Economic
   lens for spread; lands inside the "show, don't tell" standard.
3. **A3 — Federal agency CEO RM1m bribe.** Governance lens; pairs with A1 for a
   "small grift, big pattern" piece (space it after A5 so two corruption pieces
   don't run back-to-back).

Hold for guardrails rather than slotting by default:
- **A2 (Penang temple)** — high leverage but HIGH 3R. Develop only with Stage 5
  re-enabled and every specific traced to two independent primary sources
  (JHEAIPP order text first). If that bar is not met, hold the issue.
- **A4 (Bersatu/Suhaili)** — already in flight. Next action is to clear the
  `verification-needed` note, not to re-open it.

This sequence keeps lens diversity (Legal → Economic → Governance) and keeps
the single HIGH-3R item (A2) on an elevated-verification track.

## Verification still pending (do before drafting briefs)
- Confirm none of A1/A3/A5 were already shipped in issues 1992–2000.
- Re-run the curator against the 2026-05-30 queue + current silence-watch to
  refresh `top-issues-to-develop.md` (it is ~13 days stale).
- For A2: gate the Stage 5 decision and publication on the `source_diversity`
  and two-primary-source checks.

_Generated as an editorial-review companion to the radar scan; supersede on the
next curator refresh._
