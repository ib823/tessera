# Worked Example: Engine Context in a Phase 1 Brief

**Status:** internal T4A — illustrative reference, not a published brief
**Companion:** `malaysia-political-simulation-engine.md`, `engine/templates/publish-playbook.md`

This document shows how the simulation engine's `ENGINE CONTEXT` block fits
inside an actual Phase 1 brief, and how the brief author should read the
engine output as system-context (not as cards to publish).

The worked example is **a hypothetical brief for a GE15-aftermath story** that
asks: "Was the Unity Government's BN inclusion structurally necessary, or a
contingent royal choice?" — the kind of question T4A's editorial frame is
built to surface.

---

## How the engine context fits

Standard Phase 1 brief skeleton (excerpt — full format in `CLAUDE.md`):

```
ISSUE: …
PERIOD: …
CONTEXT: …
ACTORS: …
RELEVANT LAW: …
KEY STATISTICS: …
12-DIMENSION RISK ASSESSMENT: …
RECOMMENDED LENSES: …
SOURCES: …
CONTRADICTIONS: …
SOURCE SPECTRUM CHECK: …
```

With the engine, an optional block inserts between `CONTEXT` and `ACTORS`:

```
ISSUE: …
PERIOD: …
CONTEXT: …

[ENGINE CONTEXT inserted here — runs `node scripts/sim-brief-context.mjs --scenario ge15-actual`]

ACTORS: …
…
```

The brief author runs the engine query, reviews the output, and pastes the
relevant subset (full output or just the structural-reading section) into the
brief.

---

## The hypothetical brief

**ISSUE:** GE15 coalition arithmetic — was BN's Unity Government inclusion structurally over-determined?

**PERIOD:** P7 (Hybrid Instability, 2018-present). The 24 November 2022
formateur appointment is the proximate event; the antecedents are the 2018-2020
PH-Bersatu split, the 2020 Sheraton Move, and the 2019 Muafakat Nasional
PAS-UMNO realignment.

**CONTEXT:** GE15 (19 November 2022) produced Malaysia's first hung parliament.
PH won 82 seats, PN 74, BN 30, GPS 23, GRS 6, Warisan 3, MUDA 1. No coalition
reached the 112-seat simple majority. After five days of statutory declarations
and palace consultations, YDPA Sultan Abdullah appointed PH chairman Anwar
Ibrahim as PM on 24 November. The eventual Unity Government included PH + BN +
GPS + GRS + Warisan + smaller parties (148 seats, 66.7%).

The dominant published narrative reads BN's inclusion as a royal-arbitration
outcome — the King urged broad consensus, BN agreed under pressure. The
question this brief asks: does that narrative under-weight the structural
forces that would have produced the same outcome anyway?

[ENGINE CONTEXT inserted below — paste of `sim-brief-context.mjs --scenario ge15-actual` output:]

---

### ENGINE CONTEXT — ge15-actual (federal)

*Source: T4A simulation engine, 5-mechanism pipeline. **Internal use only — not for publication as numerical claims.** Engine MAPE on GE12-15 backtest is 30.3% (1/4 elections passes <25% threshold); qualitative coalition family is more reliable than specific seat counts.*

**Scenario:** GE15 federal 2022 — actual documented seats (post-electoral, no electoral mechanism run).

**Inputs — seats (electoral pass-through):**

| Party | Seats |
|---|---:|
| PH | 82 |
| PN | 74 |
| BN | 30 |
| GPS | 23 |
| GRS | 6 |
| Warisan | 3 |
| MUDA | 1 |

**Coalition mechanism — top-3 candidates (formateur PH):**

| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |
|---:|---|---:|---:|---:|---:|
| 1 | GPS+GRS+PH+Warisan | 114 | 0.223 | 0.86 | 55 |
| 2 | GPS+GRS+MUDA+PH+Warisan | 115 | 0.201 | 0.82 | 54 |
| 3 | GPS+GRS+MUDA+PH | 112 | 0.194 | 0.79 | 53 |

**Patronage entrants (legal-exposure driven):**

- Barisan Nasional (BN): legal exposure 0.85, entry margin 0.87

**Royal intervention — FIRED** (crisis 0.73, threshold 0.5):

- Natural: PH+GPS+GRS+Warisan (114 seats)
- Broadened: PH+GPS+GRS+Warisan+MUDA+BN (145 seats)
- Additions: MUDA +1, Barisan Nasional +30

**Structural reading (for brief author):**

- Natural top coalition is GPS+GRS+PH+Warisan (114/222 seats, 51.4%).
- Borneo bloc (GPS/GRS) is in the coalition; T4A issue 1705 (Borneo Affairs Ministry demand) is leverage to watch.

**Known calibration limits to read this output against:**

- PAS seats typically over-predicted (rural-bias model misses regional concentration). If PAS is in the scenario, trim its predicted seats mentally by 20-40%.
- BN seats under-predicted in dominant-party periods (base-erosion not modelled).
- Engine does NOT capture: foreign-policy shocks, intra-party leadership crises, post-election defections, judicial rulings that re-shape institutions.

---

[Back to the brief proper:]

**ACTORS:** Anwar Ibrahim (PH chairman, PMX); Zahid Hamidi (UMNO president, DPM,
Court Cluster); Muhyiddin Yassin (PN chairman, contesting formateur claim);
Sultan Abdullah Sultan Ahmad Shah (then-YDPA); Hajiji Noor (GRS chairman);
Abang Johari (GPS chairman); Anthony Loke (DAP secretary-general). Court Cluster
UMNO leaders — Zahid, Tengku Adnan, Bung Mokhtar — collectively had 47+ pending
criminal charges at the time of formation.

…

**[the brief continues with RELEVANT LAW, KEY STATISTICS, etc.]**

---

## How to read the engine output (writer's brain)

Three structural findings the engine surfaces from these inputs that the brief
author should foreground in the editorial work:

### Finding 1: The natural-minimum-winning coalition WAS PH+GPS+GRS+Warisan

114 seats out of 222 (51.4%). It is the smallest ideologically-coherent
coalition PH could form. It existed as a possibility; the question is why the
realised coalition included more.

### Finding 2: BN's patronage entry was structurally MOTIVATED

The engine computes BN's "inside-government value" against its "outside-
government value" using the documented legal exposure of UMNO's Court Cluster
(encoded at 0.85). The entry margin of 0.87 indicates BN's revealed preference
for being inside the coalition was strong. This is independent of royal
arbitration — it is the patronage logic of UMNO's senior leadership during
active prosecution.

### Finding 3: Royal intervention DID fire, but for stability not BN-inclusion

With the natural coalition at 51.4%, the crisis-level signal (0.73) exceeds the
royal-intervention threshold (0.50). The engine broadens the coalition toward a
stability buffer (57%+ target). The broadening adds BN + MUDA, reaching 145
seats. This is close to but not identical to the documented 148-seat outcome —
the small gap reflects the engine's electoral mis-prediction of Borneo seat
concentration and the omission of post-formation smaller-party joiners.

### Editorial implication

The dominant narrative ("YDPA pressed for broad coalition; BN reluctantly
joined") is technically true but causally incomplete. The engine reads BN's
inclusion as **over-determined**: structurally, BN had reason to want in
(legal exposure); arithmetically, PH needed a majority cushion; institutionally,
royal arbitration favored broader stability. Three independent pressure-vectors
pointing the same direction. A counterfactual where BN refused to join would
require all three to fail simultaneously, which is the published narrative's
implicit claim about a single-vector causation.

This is exactly the kind of finding T4A's structural-reframe pattern is built
to surface: not "the royal decided," not "BN was forced," but **"three
independent pressures converged on the same outcome, and the visible event
(royal arbitration) was the proximate cause that obscured the structural
inevitability."**

---

## Where the engine's output goes in the published issue

**Engine output is NEVER published as numerical claims.** Per design doc §8.3:

- ✗ "T4A's model predicts BN had 87% entry incentive"
- ✗ "The engine assigns 21% selection weight to the natural coalition"
- ✗ "Simulation showed royal intervention with 0.73 crisis level"

The engine output IS used to shape the published reframe and view cards:

- ✓ **Reframe card:** "BN's inclusion wasn't a royal favor. It was the
  arithmetic, the legal exposure, and the institutional preference for
  stability — three independent pressures pointing the same way."
- ✓ **View card:** "The proximate cause of the Unity Government was the royal
  formateur selection. The structural cause was that no other configuration
  satisfied the constitutional and patronage arithmetic."

The engine helped the writer FIND the structural argument; the published cards
present that argument in editorial voice, with primary-source citations
(SD-9 statutory declarations, palace press release, court charge sheets).

---

## When NOT to invoke the engine

The engine is built for system-level questions about coalition arithmetic,
electoral mechanics, royal arbitration, and patronage flow. It is **not** built
for:

- **3R community-impact stories.** No theological or community-effect modelling.
- **Single-actor scandals.** The engine has no representation of individual
  scandals beyond their ScandalRevelation event type — it doesn't simulate
  individual cases.
- **Demographic-shift stories unconnected to coalition formation.** Census,
  fertility, migration — no engine value.
- **Cultural or rhetorical pattern analysis.** The Stage 6 synthesis preamble
  handles this.

When in doubt, do not invoke. The engine adds value when it can produce a
structural finding the writer would have missed; it produces noise when the
writer would have reasoned correctly without it.

---

## Limitations the writer must remember

1. **Calibration limits documented in every engine output.** PAS systematically
   over-predicted, BN under-predicted in dominant-party periods. Trust the
   qualitative coalition family, not the specific seat counts.

2. **Five of seven mechanisms implemented.** Drift §5.5 (constitutional drift
   over time) and cascade §5.7 (scandal-driven coalition collapse) are not
   yet built. If your story involves either, the engine has nothing to say.

3. **No causal certainty.** Engine outputs are probabilistic and structural,
   not deterministic. "The engine predicts X" is sloppy; "the engine routes
   the coalition arithmetic to a family containing X" is correct.

4. **No external publication of numerical engine output.** Repeat as needed:
   the engine informs the writer's reasoning, not the reader's reading.
