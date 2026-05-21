# Sim Engine — Readiness Handoff

**Status:** internal T4A — operational handoff after a single-session build arc
**Companion:** `malaysia-political-simulation-engine.md` (design), `sim-engine-ge16-scenarios.md` (first report), `sim-engine-brief-integration-example.md` (worked example)
**Last build session:** 2026-05-21

The engine is at a natural stopping point. This doc tells the next session
(or the next user under publishing pressure) exactly where things stand,
how to invoke what's built, and what evidence to capture from real use
that should drive whatever gets built next.

---

## 1. Snapshot

| Layer | Status | Path |
|---|---|---|
| Design / theory | Done | `docs/research/malaysia-political-simulation-engine.md` |
| Event taxonomy + encoding priority | Done | `docs/adr/0005`, `docs/adr/0006` |
| JSON schemas (6 files) | Done | `engine/sim/schema/` |
| Seed records (30 actors, 4 cleavages, 4 institutions, 18 events) | Done | `engine/sim/data/` |
| Event-extractor (745 candidates queued) | Done | `scripts/sim-extract-events.mjs` |
| Coalition mechanism §5.1 | Done | `engine/sim/mechanisms/coalition.mjs` |
| Electoral mechanism §5.6 | Done | `engine/sim/mechanisms/electoral.mjs` |
| Royal mechanism §5.4 | Done | `engine/sim/mechanisms/royal.mjs` |
| Patronage mechanism §5.3 | Done | `engine/sim/mechanisms/patronage.mjs` |
| Outbidding mechanism §5.2 | Done | `engine/sim/mechanisms/outbidding.mjs` |
| Drift mechanism §5.5 | **Not built** | — |
| Cascade mechanism §5.7 | **Not built** | — |
| State + composer (Phase 5 v0) | Done | `engine/sim/core/` |
| 4-election backtest (Phase 6 v0) | Done | `scripts/sim-backtest-elections.mjs` |
| Calibration tightening (Phase 6 v1) | **Not started** | — |
| Brief-integration query | Done | `scripts/sim-brief-context.mjs` |
| Stage-6 synthesis-check integration | **Not built** | — |

**Real-world use count:** 0. The engine has not yet been invoked on a live
publishing run. The next user closes that gap.

---

## 2. The three commands that matter most

For 90% of editorial use, these three are sufficient:

**(a) Find out what the engine says about a hypothetical GE16 coalition.**

```
node scripts/sim-brief-context.mjs --list-scenarios
node scripts/sim-brief-context.mjs --scenario ge16-najib-pardon
```

Paste output between `CONTEXT` and `ACTORS` in the brief. Drop the lines
under "Known calibration limits" if the brief author has internalised them.

**(b) Run a custom seat distribution (e.g., GE15 actual, a state election,
or a by-election sub-scenario).**

```
node scripts/sim-brief-context.mjs \
    --seats "PH:82,PN:74,BN:30,GPS:23,GRS:6,Warisan:3,MUDA:1" \
    --formateur PH --jurisdiction federal
```

**(c) Validate / re-validate the engine against documented elections.**

```
node scripts/sim-backtest-elections.mjs        # GE12 / 13 / 14 / 15
node scripts/sim-test-pipeline.mjs             # end-to-end integration
node scripts/sim-test-coalition.mjs            # coalition unit tests
node scripts/sim-data-check.mjs --strict       # data integrity
```

If any of those exits non-zero after future edits, the change broke
something. Diagnose before continuing.

---

## 3. Backlogs, ranked

In priority order — what to do next, when real use creates a demand for it.

### High priority (do when triggered)

1. **A real publishing run that invokes the engine.** This is the
   highest-information experiment we can run. Capture: did the engine output
   help the writer? Which fields did they use, which did they ignore? Did
   the qualitative claim survive Stage 2/3 review?

2. **One more mechanism — pick by real use.** If a story turning on
   constitutional drift comes up first (Article 153, Sedition Act, Johor
   appointed assemblymen), build **drift §5.5**. If a scandal-cascade
   story comes first (Sheraton-style coalition collapse, defection wave),
   build **cascade §5.7**. Do not pre-build either speculatively.

3. **Calibration tightening triggered by a specific gap.** Don't tighten
   for completeness; tighten when a real brief's engine output is
   demonstrably wrong on a specific party (e.g., PAS seats in a Kelantan
   by-election context). The fix follows the gap.

### Medium priority (when capacity allows)

4. **Stage 6 synthesis-check integration.** Wire the engine's structural
   reading into Stage 6 cross-checking. Specifically: when synthesizer is
   about to publish a claim about coalition arithmetic / royal arbitration /
   patronage, compare against engine's reading. Disagreement is a flag to
   re-examine the claim before publishing.

5. **Event encoding — focused promotion.** The 735 staging candidates are
   reproducible (run `scripts/sim-extract-events.mjs` to regenerate).
   Promote only when an event becomes relevant to a brief, not in bulk.

6. **Pre-2008 boundary set extension.** Per ADR-0006, add encoded events
   for 1957, 1963, 1969, 1971, 1981, 1988, 1998, 2008. Done in Phase 2a.
   Extending into the full 1957-2007 period (Block C) is Phase 8 work,
   only valuable if back-validation against more elections is needed.

### Low priority (probably skip)

7. **Full Phase 5 state vector.** The v0 state (parties, seats, cleavage
   salience, legitimacy, blocked pairs) is sufficient for the three
   currently-integrated mechanisms. The full (P, R, C, D, L, ρ) tuple
   from §4.1 is not needed until belief-update or Markov-regime modules
   demand it.

8. **Bayesian belief layer (§4.5).** Defer until at least one public-opinion
   tracking story demands modelling how events shift opinion. We don't
   have that demand.

9. **Regime-state Markov chain (§4.7).** Defer. With only 10 documented
   junctures, the chain has wide credible intervals; building it now
   produces a model whose uncertainty is wider than its output.

---

## 4. Signals to capture from real use

Whoever uses the engine first should keep a small log of these:

**Did the engine output help the writer?**
- Was at least one structural finding in the engine output absorbed into
  the brief's editorial framing?
- Did the writer cite any engine-derived claim in their reasoning, even
  internally? (Engine outputs are never published as numbers — but the
  *structural argument* the engine surfaces often becomes the reframe card.)
- If no: was the engine output read at all, or did it get skimmed and
  dropped?

**Where did the engine output fail?**
- Did the writer disagree with the natural-coalition prediction? Why?
- Did the engine name a coalition that's politically impossible in the
  near-term (e.g., DAP+PAS even though our blocked-pairs list excludes
  it)? Then blocked-pairs needs review.
- Was the calibration warning ("PAS over-predicted by 20-40%") accurate?
  Or did PAS underperform even more? Or out-perform?

**What did the engine NOT model that mattered?**
- Was there a structural force in the story that the engine had no
  representation of? (e.g., a leadership-succession event, a foreign-policy
  shock, an unexpected judicial ruling.) That's the gap that justifies the
  next mechanism.
- Did the writer have to look up data the engine should have provided
  (e.g., an actor's network ties, an event's date, a constitutional
  article's text)? That's the gap that justifies the next encoding push.

**How did external review (Stage 2 Gemini, Stage 3 ChatGPT) treat the
engine-informed claim?**
- Did Stage 2 flag the structural claim as bias-loaded?
- Did Stage 3 challenge the structural claim's source basis?
- If yes to either: the engine's framing needs review.

Log these in `docs/research/sim-engine-real-use-log.md` (create when first
real run happens; do not pre-create).

---

## 5. Anti-patterns — do NOT do these

1. **Do not publish numerical engine output.** Per design doc §8.3 and
   inline warnings in every engine script. "T4A's model says 73%" is a
   reputational liability. The qualitative coalition family is the
   publishable insight; the seat-share number is not.

2. **Do not run the engine on stories it has no mechanism for.** 3R
   community-impact stories, single-actor scandals, demographic-shift
   stories — engine has nothing useful to say. Don't invoke just because
   it's available.

3. **Do not tighten calibration in advance of demand.** Calibration
   tightening is satisfying but produces no editorial value if the
   tightened parameters are never used.

4. **Do not build mechanisms speculatively.** Drift and cascade are
   designed but not implemented. Implement when a real story needs
   them, not before.

5. **Do not let the engine drive the editorial conclusion.** The engine
   informs; the writer decides. If the engine says X and the writer's
   evidence says Y, Y wins. The engine is wrong more often than the
   writer is.

6. **Do not modify mechanism modules without re-running the backtest.**
   `node scripts/sim-backtest-elections.mjs` is the regression test for
   the calibration drift any modification might introduce.

7. **Do not delete the calibration-limits warning from engine output.**
   It's there because the engine is genuinely under-calibrated and
   removing the warning makes the output more dangerous, not more useful.

---

## 6. One-paragraph summary for a session-starter

> The simulation engine models Malaysian political dynamics from
> documented historical data and produces structural readings of
> coalition arithmetic, electoral mechanics, royal arbitration, and
> patronage flow. Five of seven mechanisms are implemented, the
> 4-election backtest shows mean MAPE 30.3% (qualitatively right,
> quantitatively under-calibrated), and the GE15 Unity Government is
> reproduced within 3 seats from documented seat counts. Integration
> into the Phase 1 brief workflow is live via
> `scripts/sim-brief-context.mjs`. Engine output is internal use only —
> never publishable as numerical claims. Use it on stories turning on
> coalition arithmetic, royal arbitration, or patronage; skip it for
> 3R community-impact, single-actor scandal, or demographic-shift
> stories. The next priority is to USE the engine on a real publishing
> run and capture the signals in section 4 of this doc; everything
> else waits on that evidence.

---

## 7. If something goes wrong

**Validator fails (`sim-data-check.mjs --strict` exits 1).**
The most recent edit broke data integrity. `git diff` the recent commits
on `engine/sim/data/`. Common causes: a ULID that doesn't match its
filename, a cross-reference to a deleted record, a missing primary_sources
field.

**Backtest fails on a previously-passing GE.**
Calibration drift. Likely cause: a parameter change in
`mechanisms/electoral.mjs` (rural_bias default, party rural_index) or
`mechanisms/coalition.mjs` (scoring weights). `git log` the mechanism
files; the breaking change is usually the most recent.

**Pipeline integration test fails.**
Either a mechanism return-shape changed (broke the composer's contract)
or `engine/sim/core/state.mjs` schema changed. Re-read both modules'
headers — the contracts are documented inline.

**Brief-context script returns "no winning coalition."**
The formateur party can't form a majority with the given seats. Either
relax `blockedPairs`, use a different `formateur`, or accept that no
winning coalition exists (a real finding, not a script bug). This is the
GE14 backtest failure mode — instructive, not broken.

**Engine output disagrees with a published T4A issue's conclusion.**
The engine is probably wrong. The published issue has been through Stage
2/3/6 review; the engine has not. Reading the engine output as a check
on the published claim is backward — read the published claim as a check
on the engine. If the engine surfaces a structural angle the issue
missed, that's worth a Stage 6 re-look on the next edition.
