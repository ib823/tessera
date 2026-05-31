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
  **2026-05-17** ("Latest published ID: 1991"). The repository is now at
  **issue 2000**. Issues 1992–2000 published *after* the curated list, so some
  of its Tier A/B picks are already shipped or in flight (see status column).
- The top of the raw 2026-05-30 queue is dominated by silence-anomaly **stubs**
  ("budget 2027 presentation", "parliament second session opens", "malay",
  "federal", "police", "pas", "umno"). Per the curated file's own methodology
  these are attention noise-floors, **not developable** — rank order is not
  develop order.
- **The curated list is stale and should be re-run** against the 2026-05-30
  queue before the next publish cycle.

## Status reconciliation (curated picks vs current repo)

I checked each curated Tier A/B pick against published issues 1992–2000 and the
`engine/briefs/` directory:

| Pick | Topic | Current status |
|------|-------|----------------|
| A1 | Federal Court stay on Isa Samad corruption set-aside | **Already covered — published as issue 1992** ("apex court releases courtroom audio"), same 13 May 2026 Federal Court sitting. A redundant brief (`isa-samad-federal-court-rule-137-review.md`) also exists. **Drop** unless a genuinely new development (the actual stay/set-aside ruling) lands |
| A2 | Penang Islamic Dept halts Chinese temple's open house | **Available** — no brief, not published (verify against temple-adjacent issues 1604/1639/1955/1960 first) |
| A3 | Federal agency CEO arrested over RM1m bribe | **Available** — no brief, not published |
| A4 | Court of Appeal upholds Bersatu termination of Suhaili (Art. 49A) | **Published as issue 2000** — remove from develop list |
| A5 | PDRM CCID: investment-fraud losses RM1.47B in 2025 | **Available** — no brief, not published |
| B4 | Malaysia–West Asia trade −30.4% | **Published as issue 1996** — remove |
| B5 | ILO denies endorsing Bestinet system | **Follow-up available** — prior `bestinet-migrant-visa-monopoly` brief exists; this is a clean correction follow-on |
| B1/B2/B3 | Border arming / KKM cost-saving / Terengganu oil spill | **Available** — no briefs, not published |

## Silence-watch picks (the underreported track — was missing here)

The earlier version of this report drew only from the curated Tier A/B list and
**did not incorporate the fresh `silence-watch.md`** (regenerated 2026-05-30
03:36 UTC, queue 794). That is the radar's mechanism for surfacing high-importance
/ low-attention stories, ranked by silence × importance × age, and it is exactly
the track most likely to yield a non-saturated T4A issue. Fixing that omission:

| # | Silent story | Silence | Importance | Status / action |
|---|--------------|--------:|-----------:|-----------------|
| 1 | **Sabah 40% revenue entitlement standoff** | 0.99 | 0.62 | **Top silent pick.** In-flight brief `sabah-two-ma63-delays-akps-vs-40pc-revenue-stay.md` exists; the curated file marked an earlier Sabah-40% angle "→ published 1981". **Action:** confirm what 1981 actually covered, then either finish the in-flight brief on the *new* standoff angle or drop. MEDIUM 3R (Borneo federal-state — frame as federalism, not ethnic). |
| 2 | Suhaili Bersatu Court of Appeal | 0.99 | 0.58 | **Published as issue 2000** — accounted for. |
| 3 | Isa Samad Federal Court | 0.99 | 0.56 | **Published as issue 1992** — accounted for. |
| 4 | Parliament special sitting / royal address | 0.99 | 0.55 | HIDDEN_STORY. Verify against a primary order paper before developing; royal-address angle is 3R-adjacent (Royalty) — keep critique on process. |
| 5 | Budget 2027 presentation | 0.98 | 0.54 | Calendar **stub** (HIDDEN_STORY, 0 mentions) — a scheduled-event placeholder, not yet a developable finding. |

**Net:** of the top 5 silent issues, #2 and #3 are already published, #5 is a stub,
#4 needs a primary source. The one genuinely live, high-value silent pick is
**#1 Sabah 40% revenue standoff** — and it has an in-flight brief, so it should be
the priority to either finish or formally retire, not leave dangling.

## Selection criteria
- **Editorial leverage** (curated ordering), not raw radar score.
- **3R load** (Race, Religion, Royalty) — critique policy, not communities; the
  verification bar is *higher* for 3R-adjacent claims.
- **Stage 5 escalation** (CLAUDE.md / ADR-0004): re-enable the Grok Contrarian
  stress-test when a brief marks Religion / Ethnic / Royalty risk HIGH+, marks
  Political risk CRITICAL with a sharp take, or when Stage 3
  `source_diversity_estimate` < 0.4.
- **Don't re-develop** something already published or already briefed.
- **Lens diversity** across the next publish slots.

## Recommended development order (next 3 publish slots — Tue/Thu/Sat)

0. **Resolve the top silent pick first — Sabah 40% revenue standoff (silence #1).**
   It has an in-flight brief and the highest silence×importance score. Confirm
   what published 1981 covered; if the current standoff is a new development,
   finish the brief through the pipeline (Governance lens, MEDIUM-3R federal-state
   framing). This is the single highest-leverage underreported story and should
   not stay parked.

Then, among fresh non-silent picks:

1. **A5 — PDRM CCID RM1.47B investment fraud.** Cleanest fresh pick: no brief
   yet, low 3R, denominator-rich, Economic lens. Frame as systemic-capacity gap
   (SC enforcement bandwidth vs CCID case volume), not moral panic. Lands inside
   the "show, don't tell" standard.
2. **A3 — Federal agency CEO RM1m bribe.** Fresh, low 3R (charges filed =
   low defamation risk), Governance lens. Pairs via `related[]` with the
   corruption-accountability arc (1990 Rafizi RM1.1B, and 1992 Isa Samad).
3. **B5 — ILO denies endorsing Bestinet system.** Clean "what they said / what
   we found" correction with a ready `related[]` hook to the prior Bestinet
   issue. Social/Governance lens for spread.

This keeps lens diversity (Economic → Governance → Social) and avoids two
corruption pieces running back-to-back by leading with A5.

**A1 (Isa Samad) is dropped from the develop order** — it is already published
as issue 1992 (same hearing). The remaining `isa-samad-...` brief should be
parked, not pushed, unless the actual set-aside/stay ruling (a new event) lands.

Hold for guardrails rather than slotting by default:
- **A2 (Penang temple)** — high leverage but **HIGH 3R (ethnic + religious)**.
  Develop only with **Stage 5 re-enabled** and every specific traced to **two
  independent primary sources** (JHEAIPP order text first, not news
  characterisation). If that bar is not met, hold the issue. Confirm it is not
  already covered by temple-adjacent issues 1604/1639/1955/1960.
- **B5 (ILO/Bestinet correction)** — good "what they said / what we found"
  follow-up with a `related[]` hook to the existing Bestinet issue; promote to a
  slot if any Tier A pick is blocked.

## Before drafting briefs
- Re-run the curator against the 2026-05-30 queue + current silence-watch to
  refresh `top-issues-to-develop.md` (≈13 days stale; A1→1992, A4→2000, B4→1996
  already shipped). **The refresh must read `silence-watch.md`, not just the
  curated Tier list** — that is what this version was missing.
- For A2 and silence #4 (royal address): gate the Stage 5 decision and
  publication on the `source_diversity` and two-primary-source checks.

_Generated as an editorial-review companion to the radar scan; supersede on the
next curator refresh._
