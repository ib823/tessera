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
| **A4** | Fiscal stewardship | **Source unreachable in-env — see §8 pilot** | Jabatan Audit Negara, *Laporan Ketua Audit Negara* (state series) + state budget execution |
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

## 8. Pilot findings (2026-06-02) — A4 on Johor / Selangor / Kedah

Ran the recommended A4 pilot. It de-risked the central assumption and **falsified the
"cheap, uniform, automatable" framing** for this environment. Findings:

**Reachability (egress constraint).** This environment's egress proxy fails TLS
certificate verification for the audit/parliament hosts, so the graduated source is
**not fetchable here**:

| Host | Result |
|---|---|
| `storage.dosm.gov.my` (DOSM) | ✅ reachable (GDP/capita data pulled fine) |
| `lkan.audit.gov.my` (LKAN portal) | ❌ WAF reject ("requested URL was rejected") |
| `agdashboard.audit.gov.my` (public dashboard) | ❌ HTTP 503 |
| `parlimen.gov.my` (parliament-hosted LKAN PDF) | ❌ 503 — `CERTIFICATE_VERIFY_FAILED` at proxy |

**Audit opinion is accessible but low-variance.** Via news/LKAN summaries, **all 13
states received *unqualified* FY2024 opinions**: 4 without an other-matters paragraph
(Melaka, Pahang, Pulau Pinang, Terengganu) and 9 with (Johor, Selangor, Kedah, Perak,
Kelantan, Sarawak, Sabah, Negeri Sembilan, Perlis). A 2-level split barely de-saturates
Layer A — it is **not** sufficient on its own.

**The discriminating data is PDF-locked.** Development-expenditure execution rate,
financial-management star rating (AKB), and per-state RM irregularities live in the
full per-state LKAN volumes on `audit.gov.my` — unreachable here. DOSM (reachable)
publishes per-state government *revenue* by source, but **not** expenditure execution;
revenue ≠ stewardship, so it is a weak proxy.

**Revised conclusion.** A4 is conceptually sound and primary-sourced, but in this
environment it is **not automatable**. The uniform part (opinion) is low-value; the
high-value part (execution / ratings / findings) requires a human to download the
13 state LKAN PDFs from `audit.gov.my` in a browser. That manual fetch is the real
cost — consistent with the publishing pipeline's existing human-in-the-loop steps,
but it is **not** the cheap automated half the original §2 framing assumed.

**Decision put to maintainer (next step):**
1. **Manual PDF provision** — maintainer downloads the state LKAN volumes (or specific
   state *Penyata Kewangan*) and drops them in; the agent extracts execution/findings.
2. **Per-state assembly portals** — some states (e.g. Selangor's Dewan Negeri) self-publish
   financial statements; non-uniform, partial coverage, variable reachability.
3. **Pause A4** — record the categorical audit opinion as a thin A4 (de-saturates only
   marginally), accept Layer A stays near-saturated, keep the cohort disclosed.

### §8.1 Per-state portal probe (follow-up, maintainer chose "try per-state portals")

Tested whether state-government portals self-publish the audited actuals the LKAN
volumes would otherwise carry. Result: **partially viable for budget *plans*, not for
audited *outcomes*, and not uniform.**

**Reachability is host-specific** (same egress proxy, different per-host outcomes):

| Reachable (HTTP 200) | Blocked |
|---|---|
| `johor.gov.my`, `kedah.gov.my` | `selangor.gov.my` (000), `dewan.selangor.gov.my` (503) |
| `ikit.kedah.gov.my`, `pkpk.kedah.gov.my` (Kedah finance) | `pnj.johor.gov.my` (Johor treasury, 403) |
| `mediadigitaljohor.gov.my`, `belanjawan.mof.gov.my`, `mof.gov.my` | `treasury.gov.my` (403), `audit.gov.my`, `parlimen.gov.my` |

**What is extractable from reachable portals = budget *estimates* (anggaran), not
audited actuals.** Concrete data pulled in the probe (cited, budget-plan figures):

- **Kedah, Belanjawan 2024:** total RM1.24 b; *budgeted* deficit 13.92% (RM104.1 m);
  operating RM852.1 m; State Development Fund RM211.77 m; Water Supply Fund RM263.58 m;
  Forest Development RM14.75 m; revenue RM748 m (tax RM354.23 m = 47.36%).
  (Utusan / MOF state budget coverage, 2023-11.)
- **Johor, Belanjawan 2024:** *budgeted* surplus RM4.21 m (second consecutive surplus
  budget). (Kosmo / Utusan, 2023-11-23.)

**The audited actuals are not on the reachable portals.** The Kedah finance portal
(`pkpk.kedah.gov.my`) exposes payment systems (iSPEKS/iBayaq/iHasil) and notices, but
no *Penyata Kewangan* with actual `perbelanjaan pembangunan`. The audited actuals remain
in the LKAN / state *Penyata Kewangan* PDFs on the unreachable hosts.

**Narrowed implication.** In-environment, A4 can only be built as a **budget-plan proxy**
(e.g. development-expenditure share of budget, own-tax-revenue ratio, or budgeted
surplus/deficit) — which is a *design* signal, partly endogenous to the leader's own
choices, **not** the audited *execution/outcome* the A4 method specifies. It would also
be non-uniform (Selangor portal unreachable). The audited-execution A4 still requires
manual provision of the LKAN / Penyata Kewangan PDFs.

**Decision narrowed to:**
- **(i) Budget-plan proxy A4** — automatable for reachable states, fast, but a weaker
  design-not-outcome measure needing an explicit methodology caveat and partial coverage.
- **(ii) Manual PDF provision** — maintainer supplies the audited *Penyata Kewangan* /
  LKAN volumes; the agent extracts true execution rates. Full coverage, method-faithful.
- **(iii) Pause** — keep the cohort disclosed on the existing (honest) basis.
