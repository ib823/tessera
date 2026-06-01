# The Plumb Line — Malaysia Leader Accountability Index

*Methodology of record. Version 0.2.0 (framework). Last reviewed 2026-06-01.*

> A builder's plumb line is the non-partisan reference of true vertical. You hang it, you read it, and the wall is either straight or it is not. This instrument is the same idea applied to public office: one fixed yardstick, applied identically to every leader, built only from recorded public facts, and declared unbiased only once the bias audit proves it.

Machine-readable config: [`src/data/leaderboard/methodology.json`](../../src/data/leaderboard/methodology.json). The config is the single source of truth; this document is its prose expansion. Where the two ever disagree, the config wins and this document is the bug.

---

## 1. Why this exists, and the line it must not cross

T4A's editorial DNA is "critique the process, not the person." A by-name scoreboard of living politicians appears to violate that on its face, and it is the most legally and reputationally exposed thing T4A could publish (defamation, the Sedition Act, CMA s233, and the 3R sensitivities).

The whole instrument is built to survive that tension by construction:

1. **Recorded facts only.** Every input is a public record (Hansard, gazettes, Auditor-General reports, asset declarations, manifestos, court-record *status*) or a standard index computed on such records. Memory, training data, and model inference are never sources.
2. **One published formula, applied to everyone.** The weights, normalization, and aggregation live in a single config and run through a single code path. There is no per-leader branch. Symmetry is structural, not a promise.
3. **We never score the direction of politics.** We score the integrity of conduct and the delivery of a leader's *own* stated commitments. Whether their policy is left or right, Islamist or secular, federalist or centralist, is out of scope. This is the core non-partisanship guarantee.
4. **Prove it, then declare it.** A five-gate audit must pass before the "Bias-Audited" badge renders. The audit report is signed and reader-verifiable.

This converts "scoring people" into "auditing public conduct against a fixed yardstick," which is squarely on-brand.

### 1.1 The simulation-engine firewall

The Malaysia political simulation engine (`docs/research/malaysia-political-simulation-engine.md` §8.3) forbids publishing model-derived numbers. The Plumb Line honours that firewall absolutely: every figure originates in a cited raw observation. `scripts/build-leaderboard.mjs` imports nothing from `engine/sim`. The Shapley-Shubik pivotality in Layer C is computed from *actual* seat counts (a public record), not from any engine projection.

---

## 2. The three layers

The user asked for three approaches, each exhaustive: public records, a structured editorial panel, and a composite political-science index. All three are included. Layer weights sum to 1.0.

### Layer A — Public Record (objective, weight 0.50)

Every input is a recorded public fact. No judgement enters here.

| Dim | Name | Within-layer weight | Grounded in | Primary source |
|-----|------|--------------------:|-------------|----------------|
| A1 | Legislative output | 0.28 | Volden-Wiseman LES | Hansard, Order Paper, Gazette |
| A2 | Presence and participation | 0.18 | IPU / Mzalendo | Hansard, attendance register |
| A3 | Pledge fulfilment | 0.24 | Thomson et al. 2017 | Manifesto, gazette, ministry record |
| A4 | Fiscal stewardship | 0.16 | World Bank / IPU oversight | Auditor-General, Treasury |
| A5 | Integrity and transparency record | 0.14 | Parliamentary codes of conduct | Gazette, court cause-list, asset declaration |

**A1** applies the Volden-Wiseman Legislative Effectiveness Score: a legislator's fraction of bills at each of five stages (introduced, in committee, beyond committee, passed chamber, enacted), significance-weighted (commemorative 1, substantive 5, substantive-and-significant 10), normalized so the applicable peer set averages 1.0.

**A5** records *status only*. The vocabulary is `declared / not-declared / charged / convicted / acquitted / discharged / ongoing / none-on-record`. It never expresses an editorial verdict on guilt. A dropped or unresolved matter is recorded as such, not as a finding. The status-to-scalar mapping is published (`scripts/lib/leaderboard-scoring.mjs`, `DEFAULT_STATUS_SCALAR`) and applied identically to all.

### Layer B — Editorial Panel (structured rubric, weight 0.20)

The subjective layer, made defensible by construction. Five criteria that records cannot capture, each an anchored 0-4 ordinal scale (V-Dem style), each score carrying a one-line justification and a primary-source citation.

| Dim | Name | Within-layer weight |
|-----|------|--------------------:|
| B1 | Crisis handling | 0.22 |
| B2 | Reform delivered vs promised | 0.24 |
| B3 | Consensus and institution-building | 0.18 |
| B4 | Candor on reversals | 0.18 |
| B5 | Process discipline (restraint from 3R-baiting) | 0.18 |

Three safeguards keep Layer B honest:

1. **No score without a cited basis.** Every ordinal score names the dated event it rests on.
2. **Multiple coders, measured agreement.** T4A's existing multi-stage review supplies the coders. Inter-coder reliability is reported via Krippendorff's alpha. A criterion below threshold (0.667) is demoted to "insufficient agreement" and excluded, not silently averaged.
3. **Always shown with and without.** The board publishes both the composite and the objective-only composite (A + C, B removed). When the ranking barely moves on removing B, the reader sees that the subjective layer is not driving the result. That visible stability is the safeguard.

B5 is the only place 3R enters the instrument, and it enters as a *process-discipline* metric scoring documented de-escalation versus documented incitement findings. It scores the act, never the actor's community or belief. A negative score requires a regulator or court finding, not commentary.

### Layer C — Composite Political-Science (index, weight 0.30)

Established indices, applied symmetrically, computed on public facts only.

| Dim | Name | Within-layer weight | Grounded in |
|-----|------|--------------------:|-------------|
| C1 | Pivotality | 0.40 | Shapley-Shubik power index |
| C2 | Governance indicators (domain-scoped) | 0.32 | V-Dem |
| C3 | Legislative-network centrality | 0.28 | network analysis on division records |

C1 pivotality is descriptive, not normative: high structural power is neither good nor bad, it contextualizes how much the other dimensions matter. C2 scores only the V-Dem-style indicators within the leader's actual remit; out-of-remit indicators are N/A, never imputed.

---

## 3. The math

All functions live in [`scripts/lib/leaderboard-scoring.mjs`](../../scripts/lib/leaderboard-scoring.mjs), pure and deterministic.

1. **Raw value.** Per leader, per dimension, time-weight the raw observations across the periods in which the dimension is applicable to that period's role. Layer B ordinals map 0-4 to 0-1; A5 status maps via the published scalar; numeric counts and rates pass through for peer normalization.
2. **Normalize within the applicable peer set.** Min-max to [0,100] across the leaders for whom the dimension applies and who have a recorded value, exactly as LES normalizes to chamber mean. Rank-based fallback when the pool has fewer than five defined values (min-max is unstable on tiny samples, per the OECD/JRC Handbook).
3. **Within-layer aggregation.** Weighted arithmetic mean over the leader's applicable, defined dimensions, reweighted to sum to 1.
4. **Cross-layer aggregation (weakest-link-half).** The composite is the mean of the weighted arithmetic mean and the weighted geometric mean of the three layer scores (V-Dem electoral-democracy form). This allows partial compensation between layers but punishes a catastrophic single-layer failure: strong legislative output cannot fully buy back an integrity collapse.
5. **Objective-only composite.** The same aggregation over layers A and C, with B removed and weights renormalized.
6. **Missing data is never imputed.** A metric with no public record is N/A; the denominator shrinks and a per-leader coverage percentage is published. Imputing zero or the mean would smuggle in a hidden judgement.

### 3.1 Harmonization across roles

A backbencher has no budget-execution record; an opposition member cannot enact a government pledge. Harmonization is therefore role-relative:

- Each dimension carries a role-applicability set.
- A leader is scored only on applicable dimensions, normalized within the applicable peer set, then placed on the common 0-100 scale.
- A **comparability class** (head of government, cabinet minister, opposition frontbencher, backbencher, sub-national executive) lets readers compare like with like, while the headline index stays cross-comparable through normalization.
- **Period-based scoring** handles mid-term role changes (a minister who returns to the backbench is scored per period under each applicable class, then time-weighted).
- **Foreign benchmarks** run through the identical instrument, role classes, and normalization. They are calibration anchors, not competitors. A benchmark that scores badly on a dimension is shown honestly, which is itself part of the non-partisanship proof.

### 3.2 Validity thresholds — the instrument refuses to mislead (v0.2.0)

The M1 dry-run (`docs/audits/2026-06-01-plumb-line-m1-dry-run.md`) proved that real data can break naive scoring in two ways, so v0.2.0 adds two floors. Below either, a leader is *on file, not yet rankable*: their cited raw metrics are stored and displayed, but no composite or rank is asserted.

- **`minPeerSetSize` (3).** A dimension is normalized only when its applicable peer set holds at least three defined values. Min-max or rank normalization on one or two points is meaningless — a lone value rank-normalizes to 0, so a 100th-percentile governance score would display as 0. Below the floor the dimension is `insufficient-peer-set` and excluded from the composite, never scored as zero.
- **`minCoverageToRank` (0.50).** A leader receives a published composite and rank only when at least half their applicable dimensions carry a valid normalized score. This stops a governing-centric index from emitting a misleadingly low number for an opposition figure whose applicable dimensions are mostly uncovered.

This is why a two-person, two-class cohort produces zero ranked leaders: that is the correct answer, not a failure. The same logic guarantees the board never shows false precision before a comparable cohort exists.

### 3.3 Two-track scoring — the instrument's distinguishing feature (v0.2.0)

Every league table blends incomparable things into one number; a Works minister and a Communications minister cannot be ranked on raw project delivery without the comparison being a portfolio artefact rather than a measure of the person. The M2 A4 dry-run made this concrete (see `docs/audits/2026-06-01-plumb-line-m2-cabinet-cohort.md`). The Plumb Line resolves it by splitting the dimensions into two tracks:

- **Conduct & Structure (headline).** Integrity (A5), parliamentary conduct (A2, B1–B5), and structural position (C1, C3). These compare fairly across *any* portfolio because they measure how a leader behaves and where they sit, not portfolio-dependent output. **This track alone carries the published rank**, normalised across the whole role-class peer set, and the coverage floor is measured against it.
- **Delivery (portfolio-relative).** Output dimensions confounded by portfolio capital-intensity and scope (A1 legislative volume, A3 pledges, A4 fiscal, C2 governance). Shown *beside* the headline, normalised **only within portfolio bands** (infrastructure / economic / social / administrative) and with size-normalised measures preferred (rate, not raw count). Delivery never folds into the headline, so portfolio type can never masquerade as merit.

Layers (A/B/C — the evidence *kind*) and tracks (conduct/delivery — the *comparability class*) are orthogonal: every dimension has both. The headline composite is the weakest-link aggregate over the conduct-track dimensions; the delivery composite is reported separately and may be absent without affecting the rank. This is the same honesty as showing scores "with and without Layer B" — extended to the axis that actually threatens fair comparison.

---

## 4. The bias audit: prove it, then declare it

[`scripts/audit-scoreboard.mjs`](../../scripts/audit-scoreboard.mjs) runs five gates and emits a signed `public/leaderboard-audit.json`. The "Bias-Audited" badge renders only when every gate passes and the board is live with subjects.

1. **Symmetry.** Leader files carry only raw metrics and citations, never weights or scores. Any per-leader override key fails the gate.
2. **Source coverage.** Every recorded metric value carries a tier 1-3 citation. Any uncited number fails.
3. **Partisan-signal test (the core).** Compute the correlation ratio (eta) between coalition affiliation and the per-leader (Layer B minus Layer A) residual. If the editorial layer's residual is explained by coalition above the threshold (0.30), the panel is leaking party and the gate fails. Affiliation is recorded for this test alone and is never scored.
4. **Rank robustness.** Following Saisana-Saltelli, perturb the aggregation weights across reasonable ranges and record rank stability. Unstable ranks are published as uncertainty intervals, never false-precise integers. This gate never fails the build; it converts point ranks into ranges.
5. **Inter-coder reliability.** Krippendorff's alpha on the Layer B ordinal scores. A criterion below 0.667 is demoted to "insufficient agreement" and excluded.

The audit report is signed alongside the rest of T4A's content and is verifiable through the existing `verify.html` path.

---

## 5. What is not considered (and why)

| Excluded | Rationale |
|----------|-----------|
| Race, Religion, Royalty | Excluded by design. The only adjacency is B5, which scores process restraint, never belief or identity. |
| Popularity, polls, social-media following, charisma | Popularity is not accountability. |
| Policy direction or ideology | We never reward or punish a political position. The core non-partisanship guarantee. |
| Rumor, unproven allegation, anonymous sourcing | Fails the Accuracy Standard. Dropped, not softened. |
| Private life | Only public conduct in public office is measured. |

---

## 6. Milestones

- **M0 — done.** Methodology, config, validator, builder, and audit, all running in framework mode with no leaders scored. Published for scrutiny before anyone is graded.
- **M1 — done (v0.2.0).** One opposition frontbencher (Hamzah Zainudin) and one benchmark (Lee Hsien Loong) ingested end-to-end with every metric cited; the audit run for real. Outcome: both *on file, not yet rankable* — the correct result for a two-person, two-class cohort. The dry-run added the two validity floors (§3.2) and the A5 guilt-by-association rule, and measured the labour cost (verification-bound, ~half a day per subject, mostly producing honest N/As). Full record: `docs/audits/2026-06-01-plumb-line-m1-dry-run.md`.
- **M2 — in progress.** The static board: a full comparability class (≥5 within one role class) plus benchmarks so peer sets clear `minPeerSetSize`; signed audit, badge, and the `/scoreboard` page. Step 1 (done): a balanced five-bloc cabinet-minister cohort (Loke, Fahmi, Mohamad Sabu, Zahid, Nanta) with the A5 integrity spine sourced and normalizing across a peer set of seven — the first time any dimension scores. Two findings surfaced (the Malaysian data-availability ceiling on A2/C3, and that peer-normalizing a status scalar distorts it) and three decisions are open before any rank is published. Record: `docs/audits/2026-06-01-plumb-line-m2-cabinet-cohort.md`. A ≥3-coder Layer B panel and opposition-appropriate dimensions still land here.
- **M3.** Roster to ten, more benchmarks, per-leader detail pages, fact-graph linking to issues.
- **M4.** Weekly cadence: dated snapshots, trend lines, and a documented manual-curation protocol. Any automation gathers candidate data only; every published figure still routes through a human citation.

---

## 7. Legal and accuracy posture

Every leader, before publication, passes the existing pipeline Phase 6 legal and accuracy gate. Integrity and 3R-adjacent claims require two independent primary sources (CLAUDE.md Accuracy Standard); a claim that cannot meet that bar is dropped, not softened. All content is framed as analysis of public-interest conduct, consistent with the `/disclaimer` page.

---

## 8. Sources

The grounding literature, with the role each plays, is enumerated in the `citations` block of [`methodology.json`](../../src/data/leaderboard/methodology.json): Volden-Wiseman (legislative effectiveness), Thomson et al. (pledge fulfilment), V-Dem (ordinal scales and weakest-link aggregation), the OECD/JRC Handbook (normalization and aggregation), Saisana-Saltelli-Tarantola (sensitivity analysis), Krippendorff (inter-coder reliability), Shapley-Shubik (pivotality), the IPU Indicators for Democratic Parliaments, and the World Bank parliamentary oversight frameworks.
