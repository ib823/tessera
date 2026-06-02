# The Plumb Line — Editorial Panel (Layer B) coder protocol & onboarding

This is the recruitment-and-scoring kit for the independent panel whose work
unlocks a published rank. Read it in full before scoring. It is the operational
companion to `docs/research/leader-accountability-index.md` (methodology) and
`src/data/leaderboard/methodology.json` (the live config).

---

## 0. Why this panel exists — the bar you are clearing

The Plumb Line publishes **no rank** until Layer B (the conduct panel) is scored
by **≥3 independent coders** and two bias gates clear:

- **Inter-coder reliability** — Krippendorff's α ≥ **0.667** across all Layer B
  items. This proves coders *agree*; a number a lone author asserts is not a
  measurement.
- **Partisan-signal test** — the correlation ratio η between coalition and the
  Layer-B-minus-Layer-A residual must stay ≤ **0.3**. This proves the panel is
  reading **conduct, not party**.

Your scores are the evidence those gates test. Until they pass, the badge is
withheld and the board shows "in audit" — by design. **A blank rank column is
the point, not an omission.**

> There is already one coder's pass on file (the editorial first draft). You
> will **not** see it. You score the same items, blind, from the evidence — that
> is the only way the reliability gate means anything.

---

## 1. What you score — Layer B, dimensions B1–B5

For each leader, you assign five conduct scores. Each rests on the **public
record**, not impression. The five (with their weight in Layer B):

| Dim | What it measures | Weight |
|---|---|---:|
| **B1** | Crisis handling — a discrete public crisis within the leader's remit | 0.22 |
| **B2** | Reform delivered vs promised — were championed reforms enacted, diluted, or abandoned | 0.24 |
| **B3** | Consensus & institution-building — strengthening institutions / cross-bench instruments vs capture/erosion | 0.18 |
| **B4** | Candor on reversals — honesty when reversing a stated position | 0.18 |
| **B5** | Process discipline — restraint from inflaming Race, Religion, Royalty (3R) for advantage | 0.18 |

---

## 2. The anchored scale (integers 0–4)

Score whole numbers 0–4. The anchors at 0 / 2 / 4 are fixed and published; 1 and
3 are the legitimate between-anchor values.

| Dim | 0 | 2 | 4 |
|---|---|---|---|
| **B1** | Worsened the crisis or evaded responsibility on the record | Adequate, documented response, mixed outcomes | Documented, decisive response with measurable resolution |
| **B2** | Championed a reform then abandoned/reversed it | Partial reform enacted with material dilution | Reform gazetted and operative as promised |
| **B3** | Documented institutional capture or norm erosion | Worked within institutions without strengthening them | Documented strengthening of an institution or a cross-bench instrument |
| **B4** | Reversed a position while denying the reversal | Reversed without explanation | Reversed and explained the reasons on the record |
| **B5** | Documented finding of inflaming 3R for advantage | No documented instances either way | Documented, dated act of de-escalating a 3R flashpoint |

A score is the **aggregate** of the leader's record on that dimension over the
tenure window, not a single episode — but every point you give must be anchored
to dated, cited events (§3).

---

## 3. The evidence rule — non-negotiable

1. **Score only what is cited and dated.** Each score must rest on at least one
   dated event with a primary or named-outlet-citing-primary source. Memory and
   impression are not evidence. If a dimension has no qualifying dated event,
   record **"no qualifying event"** — do not invent a score.
2. **Conservatism cuts both ways.** Do not inflate a 4 on thin sourcing; do not
   assign a 0 on contested or single-source material. A 0 or a 4 requires
   **explicit, uncontested** documentation. When the evidence is softer than the
   claim, soften the score.
3. **3R discipline on B5 (highest sensitivity).** Only score B5 = 0 or 4 with an
   uncontested, dated finding (a court ruling, an official record, an
   uncontested act of de-escalation). Heated rhetoric that one side reads as
   inflaming and another defends is **contested → anchor 2 / no qualifying
   event**. Critique conduct and process; never a community or belief.
4. **Distinguish the subject's own status** from a relative's, an associate's, a
   subordinate's, or a predecessor's matter. Guilt by association is never scored.
5. **Aggregate honestly.** If a leader delivered one reform and abandoned
   another, the dimension is "partial" (≈2), not the best or worst episode.

---

## 4. Independence — what makes your score count

- **Score blind and alone.** Do not confer with other coders, do not look up how
  anyone else scored, do not discuss specific scores until all are submitted.
- **You receive:** an evidence packet per leader — the dated events and their
  citations for B1–B5 (§9), plus this protocol and the anchors. Nothing else.
- **You do NOT receive:** any existing scores, the first-coder draft, other
  coders' submissions, or the leaders' coalition highlighted as a factor.
- **Score from the packet.** You may open the cited sources to verify; you may
  add a dated event the packet missed (cite it). You may not import undated
  impressions.

---

## 5. Conflict of interest & recusal

Before scoring, sign the COI declaration (§10A). **Recuse from any leader** where
you have, or in the last 5 years have had, any of:

- employment, contract, candidacy, or office under that leader or their ministry;
- membership or office in that leader's party;
- a family or close-personal tie to the leader;
- a financial interest a reasonable person would see as compromising.

Recusal is per-leader, not all-or-nothing. The panel is sized so every item still
gets ≥3 non-recused coders. A general political opinion is **not** a conflict —
that is what the partisan-signal gate exists to absorb; declare it, then score
the record.

---

## 6. Non-partisanship — the discipline the gate measures

Apply **exactly the same evidentiary standard** to a government minister, an
opposition figure, and a benchmark. Do not soften or sharpen because of who they
are. The partisan-signal test (§0) will compute whether coalition explains your
collective residual; balanced *recruitment* across the spectrum
(government-aligned, opposition-aligned, independent/academic) plus identical
standards is how the panel passes it. If you cannot score a subject's record
without scoring their party, recuse.

---

## 7. The two gates your scores feed

- **Krippendorff's α (interval) ≥ 0.667** over every Layer B item with ≥2
  coders. Low α means the panel is not measuring a shared thing — items with
  wide disagreement are re-examined (§8), not averaged over.
- **Partisan-signal η ≤ 0.3** between coalition and the (Layer B − Layer A)
  residual. η above threshold means the editorial layer is leaking party; the
  panel and protocol are reviewed before any rank publishes.

Both are computed by `scripts/audit-scoreboard.mjs`. Neither can be hand-waved.

---

## 8. Mechanics

- **Panel size:** ≥3 independent coders per item (the floor for a meaningful α
  and a stable median). More is better, especially for 3R-adjacent subjects.
- **Recording:** each coder submits an integer 0–4 (or "no qualifying event")
  per leader per dimension. Submissions are appended to each metric's
  `coderScores` array; the published metric **value is the median** of the
  coders. A single-coder item stays provisional and unscored.
- **Outliers / disagreement:** where coders diverge by ≥2 points on an item, the
  panel re-opens *the evidence* (not the scores) — usually one coder saw a dated
  event the others missed, or read a contested item as uncontested. Re-score from
  the corrected packet. Never split the difference without re-examining evidence.
- **Re-runs:** after ingestion, re-run validate → build → audit. α and η print;
  the badge is granted automatically only when both clear.

---

## 9. Workflow, end to end

1. **Packet build.** For each leader, assemble the B1–B5 evidence packet: the
   dated events + citations (these already exist in each leader's metric
   justifications; strip the scores). Save one packet per leader.
2. **Recruit & declare.** ≥3 coders across the spectrum; each signs the COI form
   and marks recusals.
3. **Blind scoring.** Each coder scores every non-recused leader from the packet.
4. **Submit.** Coders return the submission sheet (§10C) — scores + a one-line
   dated justification per score.
5. **Ingest.** Append each coder's scores to the leaders' `coderScores`; set each
   metric value to the median.
6. **Gate.** Run the audit. If α ≥ 0.667 and η ≤ 0.3 → badge granted.
7. **Adjudicate** any ≥2-point divergences (§8) and re-run if needed.
8. **Publish — as ranges.** Ranks publish with their robustness ranges; the
   board, fingerprints, and OG cards auto-reveal.

---

## 10. Templates

### 10A. Conflict-of-interest declaration

```
Coder: ____________________   Date: __________
Affiliation/background (for spectrum balance, not disqualifying): __________
I declare the following ties (employment, party office, family, financial) to any
subject in the last 5 years, and recuse from those subjects:
  - Subject: __________  Tie: __________  → RECUSE
  - (none) ☐
I will score blind, alone, from the evidence packet, applying the same standard
to every subject regardless of coalition. I have read the protocol.
Signature: __________
```

### 10B. Per-leader evidence packet (one per subject; scores stripped)

```
LEADER: <name> · <role> · <tenure window>
B1 Crisis handling
  - <dated event> — <source title>, <publisher>, <date>, <url>, tier <1-3>
  - ...
B2 Reform delivered vs promised
  - ...
(… B3, B4, B5 …)
[No scores included. Coders score from these events.]
```

### 10C. Coder submission (per coder; ingests into `coderScores`)

```json
{
  "coder": "<id or pseudonym>",
  "submittedAt": "<date>",
  "scores": [
    { "leader": "<slug>", "B1": 2, "B2": 3, "B3": 2, "B4": 2,
      "B5": null,
      "why": { "B1": "<dated event + 1 line>", "B2": "...", "B3": "...", "B4": "...", "B5": "no qualifying event" } }
  ]
}
```

`null` = no qualifying event (the item stays unscored for that coder, excluded
from α). A score with no `why` line is rejected.

---

## 11. Acceptance — when the rank publishes

All of the following, together:
- ≥3 independent coders per scored item, COI-cleared;
- Krippendorff's α ≥ 0.667;
- partisan-signal η ≤ 0.3;
- every published score traces to a dated, cited event;
- the Phase-6 legal + accuracy check passes on the *ranked* presentation
  (defamation, 3R, Sedition, CMA, OSA);
- the three open methodology calls decided (A5 severity weighting, the
  `pardoned` scalar, benchmark anchors).

Until then: on file, not ranked. The withheld badge is the trust.
