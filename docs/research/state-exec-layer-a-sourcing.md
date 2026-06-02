# Scoping: objective Layer-A sourcing for the state-executive cohort

**Status:** scope (not yet started) · **Date:** 2026-06-02 · **Owner:** leaderboard methodology
**Motivates:** ADR 0007 (partisan-signal per-class certification) · the `sub-national-executive` disclosed finding

## 1. Problem this solves

The partisan-signal gate measures whether the **editorial** layer (B) leaks coalition
*beyond what the objective public record (A) already shows*. It does this on the
residual `B − A`. For the 13-state sub-national-executive cohort that residual is
currently **not** an editorial-minus-objective difference — it is essentially the
editorial score alone, because Layer A is saturated:

- A1 (legislative output) — `no-data`
- A2 (presence/participation) — **structurally excluded** for MY (no per-member records)
- A3 (pledge fulfilment) — `no-data`
- A4 (fiscal stewardship) — `no-data`
- A5 (integrity) — scored, but ~uniform (`none-on-record` → 100 for 12 of 13)

So `A ≈ 100` for every state head and `residual ≈ B − 100`. The gate is testing
"do editorial scores correlate with coalition," with **no objective baseline to
difference against**.

### Empirical confirmation (2026-06-02)

A pre-specified control for **GDP per capita** (DOSM, GDP by State 2024, Table 44)
was run as a candidate structural covariate:

| η(coalition, editorial residual) | value |
|---|--:|
| raw, within-class | 0.619 |
| GDP/capita-controlled (partial-η) | **0.615** |
| threshold to certify | 0.30 |

Controlling for state wealth moved η by 0.004 — nothing. The coalition signal is
**not** a wealth/capacity artifact (PH governs the *richest* states — Penang
RM76k, Selangor RM66k — and scores low; BN sits mid-wealth and scores highest).
An external covariate cannot fix a **missing-baseline** problem. The fix is to
give Layer A real, cited, objective content.

## 2. Scope: which dimensions, and why

Target the two A-dimensions whose `appliesToRoles` already include
`sub-national-executive` **and** for which per-state primary sources exist:

| Dim | Name | Feasibility | Primary source |
|---|---|---|---|
| **A4** | Fiscal stewardship | **Tractable** — uniform source, do first | Jabatan Audit Negara, *Laporan Ketua Audit Negara* (state series) + state budget execution |
| **A3** | Pledge fulfilment | **Hard** — uneven manifestos, needs coder panel | State-election manifesto of each governing coalition + delivery record |

Out of scope: **A2** (structurally excluded for MY) and **A1** (state assemblies/DUN
publish little machine-readable legislative output; parliament-centric metric).
If A3 proves infeasible to a defensible standard, A4 alone still de-saturates Layer A.

## 3. A4 — Fiscal stewardship (Phase 1, do first)

- **Source of record:** `audit.gov.my` — *Laporan Ketua Audit Negara* publishes a
  per-state volume each year covering (a) certification of the state's financial
  statements (*Penyata Kewangan*), (b) financial-management rating
  (*Pengurusan Kewangan* / AKB star rating where published), (c) activity audits
  with quantified questioned/wasted sums.
- **Metric value (numeric 0–1, peer-normalized across the 13 states):** a composite of
  - development-expenditure execution rate (actual ÷ budgeted), and
  - inverse severity of audit findings (financial-management rating; value of
    questioned spending as a share of the state budget).
- **Value shape:** numeric rate → `rawScore` returns as-is → `normalizeWithinPool`
  min-maxes across the 13-state pool (minPool 5 satisfied). **No code change** — the
  scoring path already handles numeric A-layer rates.
- **Effort:** ~13 states × 1–2 h to locate the latest 2–3 reporting years and extract
  the three numbers. Document year-coverage gaps and any late-certified statements.
- **Risks / contradictions to log:** non-uniform reporting years; states that certify
  financial statements late; the audit's own rating methodology evolving year to year.
  Use the most recent fully-certified year per state; note discrepancies in-file.

## 4. A3 — Pledge fulfilment (Phase 2, accept partial coverage)

- **Source of record:** each governing coalition's **state-election manifesto**
  (Johor 2022, Melaka 2021, Sarawak 2021, the six 2023 state polls — Selangor, N.
  Sembilan, Penang, Kedah, Kelantan, Terengganu — Sabah/Perak/Pahang/Perlis per their
  cycles), coded against state budget speeches and delivery reporting.
- **Method:** Thomson et al. (2017) — each pledge independently coded full / partial /
  not, against the denominator the **state** government could deliver (the
  government/opposition denominator asymmetry already in the A3 method). Score =
  weighted fulfilment rate (0–1), peer-normalized across states.
- **Effort:** **HIGH** — ~13 × 4–8 h. Manifesto availability is uneven (some coalitions
  ran on the federal manifesto); enumeration + per-pledge evidence is labor-intensive;
  the methodology expects a **blind coder panel** for inter-coder agreement.
- **Honest fallback:** if A3 cannot reach the inter-coder standard for all 13, score the
  subset that can and leave the rest `no-data` (disclosed), relying on A4 to de-saturate.

## 5. Data-model & pipeline impact

- Add `{ dimension: "A3"|"A4", value: <numeric rate>, justification, citation }` objects
  to each state head's `periods[].metrics` in `src/data/leaders/*.json`. Leader files stay
  raw-observation-only (symmetry gate); **no scores in leader files**.
- `build-leaderboard.mjs` + `leaderboard-scoring.mjs` need **no changes** — numeric
  A-layer values already flow through `rawScore` → `normalizeWithinPool`.
- Once populated, `A` for state execs is no longer ~100; `residual = B − A` becomes a
  genuine editorial-deviation-from-record. Re-run `audit-scoreboard.mjs`.

## 6. Pre-registered decision rule (integrity guardrail)

Decide the rule **before** seeing the recomputed η (same discipline as the GDP/capita test):

1. Repopulate Layer A (A4, then A3 where feasible).
2. Recompute within-class η(coalition, `B − A`).
3. **If the coalition gap is also present in Layer A** (the objective record itself differs
   by coalition) → the editorial residual η should fall; the gap is a **real record
   difference**, supporting certification or a defensible evidence-grounded finding.
4. **If the gap lives only in Layer B** while A is balanced → confirms an editorial leak →
   the cohort **stays disclosed**, now on solid evidence rather than a saturated baseline.
5. ≥2 independent primary sources for any 3R-adjacent A5/A3 claim; log all contradictions.

## 7. Recommended sequencing

- **Pilot (½ day):** A4 on 2–3 states (one each from BN / PN / PH) to validate the
  *Laporan Ketua Audit Negara* extraction pipeline and the composite-value definition.
- **Phase 1 (1–2 days):** A4 for all 13.
- **Phase 2 (3–5 days):** A3 where manifestos and a coder panel allow; partial coverage OK.
- **Phase 3:** re-run the gate, write the ADR 0007 addendum with the pre-registered rule,
  decide certify-vs-disclose on the evidence.

**Recommendation:** start with the A4 pilot before committing to all 13 — it is the
tractable, uniform-source half and proves the pipeline cheaply.
