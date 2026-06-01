# ADR 0007 — The Plumb Line: Leader Accountability Index

- Status: Accepted (framework / M0)
- Date: 2026-06-01
- Supersedes: none
- Related: ADR 0004 (retire stages 4 and 5), `docs/research/leader-accountability-index.md`, `docs/research/malaysia-political-simulation-engine.md` §8.3

## Context

T4A was asked to build a live, weekly-updated scoreboard ranking named Malaysian political leaders against a fixed yardstick, benchmarked against exemplary leaders from other countries, and "declared unbiased only once proven so."

This collides with three standing commitments:

1. **"Critique the process, not the person."** A by-name leaderboard is, on its face, the opposite.
2. **The Accuracy Standard.** Every published number must trace to a primary source.
3. **The simulation-engine firewall (§8.3).** Model-derived numbers must never be published.

It is also the single most legally exposed artifact T4A could ship (defamation, Sedition Act, CMA s233, 3R).

## Decision

Build the scoreboard, but only in a form that is non-partisan by construction:

1. **Recorded facts only.** Every input is a public record or a standard index computed on public records. No memory, training data, or model inference. The builder imports nothing from `engine/sim`.
2. **One config, one code path.** Dimensions, weights, role applicability, normalization, and aggregation live in `src/data/leaderboard/methodology.json`. Leader files carry only raw, cited observations. `scripts/build-leaderboard.mjs` is the only place raw values become scores. There is no per-leader branch, so symmetry is structural.
3. **Three layers, capped subjectivity.** Public Record (0.50), Editorial Panel (0.20), Composite Political-Science (0.30). The editorial layer is capped at 0.20, is anchored to ordinal scales with cited justifications, is measured for inter-coder reliability, and is always shown with and without.
4. **Score conduct and delivery, never ideology.** We never reward or punish a political direction. We score the integrity of conduct and delivery against a leader's own stated commitments.
5. **Prove it, then declare it.** A five-gate audit (symmetry, source coverage, partisan-signal, rank robustness, inter-coder reliability) gates the "Bias-Audited" badge. The audit report is signed and reader-verifiable.
6. **Sequenced milestones.** M0 ships the framework with no leaders scored. Numbers come later, after the framework has been scrutinized.

## Non-partisanship guarantees (the testable claims)

- **G1 Symmetry.** No per-leader configuration exists. Enforced by the symmetry audit gate.
- **G2 Traceability.** Every recorded value carries a tier 1-3 primary-source citation. Enforced by `validate-leaderboard.mjs` and the source-coverage gate.
- **G3 Ideology-blindness.** Affiliation is recorded only to *test against* the result (partisan-signal gate); it never enters a score.
- **G4 Editorial containment.** Layer B is capped at 0.20, reliability-measured, and shown with and without. The partisan-signal gate fails the badge if B leaks coalition.
- **G5 No false precision.** Weight-sensitive ranks are published as intervals.
- **G6 Firewall.** No value originates from the simulation engine.

## Consequences

- **Positive.** A compelling, visual, level-instrument product whose neutrality is checkable rather than asserted. Each low-scoring cell is a ready-made T4A issue.
- **Cost.** Full citation of every metric is labour-intensive; M1 exists to measure that cost before scaling to ten leaders.
- **Risk retained.** Legal exposure of by-name scoring. Mitigated by recorded-status-only framing, the Phase 6 legal gate per leader, two-source rule for integrity and 3R-adjacent claims, and M0-first derisking.

## Alternatives rejected

- **Pure objective index (no editorial layer).** Rejected: the user explicitly wanted the editorial dimension. Contained rather than excluded.
- **Composite political-science only.** Rejected: too close to the §8.3 line (estimated, not recorded, inputs).
- **Automated weekly scraping.** Deferred to M4 as a data-gathering aid only; it must never auto-publish an uncited number.
