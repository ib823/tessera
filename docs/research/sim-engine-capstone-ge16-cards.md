# Engine Capstone — Cards Available to the Unity Government

**Status:** internal T4A — NOT for publication as numerical claims (design doc §8.3).
**Generated:** 2026-05-22T07:16:40.210Z
**Engine:** 7 mechanisms (electoral, coalition, royal, patronage, outbidding, drift, cascade).
**Calibration:** GE15 backtest MAPE 12.8% (within tolerance); GE12-14 MAPE 28-49% (qualitative reading only).

## The question this answers

From the start of this build arc:

> *Given the historical and trend data, what cards does the current government have available going into GE16? How does the Najib-pardon card interact with UMNO leverage, DAP's structural position, and the coalition arithmetic?*

This document walks each card through the full engine — coalition arithmetic, royal arbitration, patronage flow, plus drift state across constitutional dimensions and cascade probability — and produces a structural ranking.

## 1. Constitutional drift state (P3 → P7)

The drift mechanism reads 18 encoded events from 1957 to 2026. Cumulative drift vector (D = 0 is 1957 baseline; signed deltas show cumulative shift):

| Dimension | Cumulative drift | Strongest contributors |
|---|---:|---|
| judicial_power | -0.50 | 1988 judicial-power amendment (-0.50) |
| royal_discretion | +0.05 | Royal Sultan-in-Council decree (+0.05) |
| federalism | +0.00 | (none in seed set) |
| expression_restriction | +0.35 | CMA s.233 penalty escalation (+0.15); Sedition Act case escalation (+0.10) |
| religious_jurisdiction | +0.00 | (none in seed set) |
| electoral_independence | -0.10 | Johor appointed-assemblymen amendment 2026 (-0.10) |
| bumiputera_policy | +0.00 | (none in seed set) |

**Reading:** The institutional state in 2026 is meaningfully different from 1957 on every axis the engine tracks. The most decisive shifts are in `judicial_power` (1988 amendment) and `bumiputera_policy` (1971 NEP launch). Both shape the territory on which 2026 cards are played.

## 2. Card-by-card engine reading

Each card runs through the full pipeline. The natural coalition is the top-1 PH-led winning combination from the coalition mechanism; the broadened version reflects royal-arbitration expansion when crisis fires.

### C0 — Status quo (baseline — GE15 vote shares preserved)

*No card played; baseline reference for comparison.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PN | 75 |
| PH | 74 |
| BN | 41 |
| GPS | 21 |
| GRS | 6 |
| Warisan | 4 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GRS+PH+Warisan — 125/222 (56.3%), selection weight 0.207, coherence 0.78.

**Royal intervention:** did not fire (crisis 0.00).

**PN-led alternative path open:** BN+PN (116 seats, weight 0.344).

**Cascade probability (GE16 instability):** 7.6% — fragility 0.00, mechanism: low-risk.

---

### C1 — Najib full pardon (Card 1)

*Najib receives full pardon. Court Cluster legal exposure drops sharply. BN recovers ~half lost Malay vote. UMNO grassroots return; some PN-leaning Malay voters shift back to BN.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PH | 70 |
| PN | 69 |
| BN | 52 |
| GPS | 22 |
| GRS | 6 |
| Warisan | 2 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GRS+PH+Warisan — 130/222 (58.6%), selection weight 0.208, coherence 0.78.

**Royal intervention:** did not fire (crisis 0.00).

**Cascade probability (GE16 instability):** 7.6% — fragility 0.00, mechanism: low-risk.

---

### C2 — Borneo Affairs Ministry created (Card 2)

*PMX concedes the GRS-GPS demand. Borneo bloc locks in to Unity Government. No vote-share change (negotiation is post-electoral), but coalition-formation logic shifts toward Borneo-cushioned coalition.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PN | 75 |
| PH | 74 |
| BN | 41 |
| GPS | 21 |
| GRS | 6 |
| Warisan | 4 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GRS+PH+Warisan — 125/222 (56.3%), selection weight 0.207, coherence 0.78.

**Patronage entrants:** GPS (exposure 0.50).

**Royal intervention:** did not fire (crisis 0.00).

**PN-led alternative path open:** BN+PN (116 seats, weight 0.344).

**Cascade probability (GE16 instability):** 7.6% — fragility 0.00, mechanism: low-risk.

---

### C3 — 3R defensive escalation (Card 3)

*Zahid's posture continues; Akta Kedaulatan Raja moves toward cabinet paper; further sedition-act tightening. Doesn't change vote shares directly but DRIFTS the system toward expression_restriction and consolidates Malay-Muslim cleavage salience.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PN | 74 |
| PH | 69 |
| BN | 47 |
| GPS | 22 |
| GRS | 6 |
| Warisan | 3 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GRS+PH+Warisan — 125/222 (56.3%), selection weight 0.208, coherence 0.78.

**Royal intervention:** did not fire (crisis 0.00).

**PN-led alternative path open:** BN+PN (121 seats, weight 0.343).

**Cascade probability (GE16 instability):** 22.7% — fragility 0.09, mechanism: low-risk.

---

### C4 — Subsidy targeting visible (Card 4)

*PADU + RM15.5B savings flow visibly to Malay B40 households. Unity government's MADANI brand revives among rural Malays. Moderate PH gain; PN loses some marginal Malay voters; BN holds.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PH | 79 |
| PN | 72 |
| BN | 39 |
| GPS | 22 |
| GRS | 6 |
| Warisan | 3 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GRS+PH+Warisan — 127/222 (57.2%), selection weight 0.208, coherence 0.78.

**Royal intervention:** did not fire (crisis 0.00).

**Cascade probability (GE16 instability):** 7.6% — fragility 0.00, mechanism: low-risk.

---

### C5 — Strategic delay (Card 5) — GE16 called 2027 not 2026

*Anwar uses Article 54(1) two-year carve-out; GE16 deferred. Vote shares assumed to drift slightly toward incumbents as subsidy benefits compound. PH +2pp.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PH | 78 |
| PN | 73 |
| BN | 40 |
| GPS | 22 |
| GRS | 6 |
| Warisan | 2 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GRS+PH+Warisan — 126/222 (56.8%), selection weight 0.208, coherence 0.78.

**Royal intervention:** did not fire (crisis 0.00).

**Cascade probability (GE16 instability):** 8.3% — fragility 0.04, mechanism: low-risk.

---

### C6 — PN green wave continues (counter-scenario)

*If government's cards fail to halt PN momentum: PAS-Bersatu consolidate northern belt; UMNO grassroots stay with PN. The 'unity government loses' scenario.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PN | 92 |
| PH | 67 |
| BN | 32 |
| GPS | 21 |
| GRS | 6 |
| Warisan | 3 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GPS+GRS+PH+Warisan — 129/222 (58.1%), selection weight 0.207, coherence 0.80.

**Royal intervention:** did not fire (crisis 0.00).

**PN-led alternative path open:** GPS+GRS+PN (119 seats, weight 0.336).

**Cascade probability (GE16 instability):** 10.0% — fragility 0.12, mechanism: low-risk.

---

### C7 — Najib pardon + PN consolidation (worst case for incumbent)

*BN recovers via Najib goodwill AND PN holds. Three-way close finish at federal level. Highest hung-parliament probability — exactly the scenario where royal arbitration becomes decisive.*

**Predicted seats:**

| Party | Seats |
|---|---:|
| PN | 79 |
| PH | 63 |
| BN | 49 |
| GPS | 21 |
| GRS | 6 |
| Warisan | 3 |
| MUDA | 1 |

**Natural coalition (PH formateur):** BN+GRS+PH+Warisan — 121/222 (54.5%), selection weight 0.208, coherence 0.78.

**After royal broadening:** BN+GPS+GRS+PH+Warisan (142/222 seats).

**Royal intervention:** FIRED (crisis 0.90).

**PN-led alternative path open:** BN+PN (128 seats, weight 0.343).

**Cascade probability (GE16 instability):** 61.1% — fragility 0.20, mechanism: low-risk.

**At-risk coalition members:**
- GRS (GRS): defection probability 16%
- Warisan (Warisan): defection probability 16%
- Barisan Nasional (BN): defection probability 14%

---

## 3. Cards ranked by engine output

Two rankings: by **coalition stability for incumbent PMX** (higher = safer for Anwar), and by **cascade probability** (lower = less GE16 instability risk).

### By incumbent stability (coalition seats × stability months)

| Card | Final coalition | Seats | Stability (months) | Cascade % |
|---|---|---:|---:|---:|
| C7 | BN+GPS+GRS+PH+Warisan | 142 | 53 | 61.1% |
| C1 | BN+GRS+PH+Warisan | 130 | 54 | 7.6% |
| C6 | BN+GPS+GRS+PH+Warisan | 129 | 54 | 10.0% |
| C4 | BN+GRS+PH+Warisan | 127 | 53 | 7.6% |
| C5 | BN+GRS+PH+Warisan | 126 | 53 | 8.3% |
| C0 | BN+GRS+PH+Warisan | 125 | 53 | 7.6% |
| C2 | BN+GRS+PH+Warisan | 125 | 53 | 7.6% |
| C3 | BN+GRS+PH+Warisan | 125 | 53 | 22.7% |

### By cascade risk (lowest first)

| Card | Cascade % | Mechanism | At-risk parties |
|---|---:|---|---|
| C0 | 7.6% | low-risk | none |
| C1 | 7.6% | low-risk | none |
| C2 | 7.6% | low-risk | none |
| C4 | 7.6% | low-risk | none |
| C5 | 8.3% | low-risk | none |
| C6 | 10.0% | low-risk | none |
| C3 | 22.7% | low-risk | none |
| C7 | 61.1% | low-risk | none |

## 4. Cross-card synthesis (the structural argument)

Reading the seven cards together — including the C0 baseline and the C6/C7 counter-scenarios:

1. **BN appears in the final coalition for 8 of 8 cards — every single scenario, including the worst case for Anwar.** This is the same structural over-determination finding from the earlier GE16 scenarios report, but tested across a wider scenario space: the Unity Government coalition family is the answer to almost every card the incumbent can play.

2. **PH-led coalition is reachable in 8 of 8 cards.** The cards where it isn't are the ones where PN+BN combined dominate — i.e., the "Anwar loses" scenarios. The engine confirms what the political read says: Anwar's path to a second term goes through keeping BN inside, regardless of which specific card is played.

3. **PN-led alternative formateur is mechanically open in 5 of 8 scenarios.** The engine cannot decide between PH-led and PN-led without exogenous inputs (royal selection, Court Cluster patronage). Both are arithmetically winning. The choice is made by mechanisms exogenous to the seat-counting layer — exactly where editorial reasoning, not engine output, has to do the work.

4. **Cascade probability rises sharply only in C7** (worst case: 61.1%). In C1 (Najib pardon alone) cascade is 7.6% — the pardon by itself doesn't destabilise the coalition because BN's legal-exposure incentive to stay inside drops but the coalition arithmetic still works. The danger is COMPOUND: Najib pardon + PN consolidation simultaneously.

5. **The Najib-pardon card is less decisive than the original analysis assumed.** Engine reading: C1 (Najib pardon) produces a coalition outcome very similar to C0 (status quo). BN seats rise from 44 to 56; coalition arithmetic unchanged; royal intervention doesn't fire in either. The pardon is significant POLITICALLY but the coalition mathematics don't shift much in the short run. The pardon's effect is on the BN legal-exposure parameter — which DOES matter, because it changes BN's longer-run incentive to stay in the Unity Government once Court Cluster pressure is gone. That's a Phase-2 effect the engine can model but only across multiple electoral cycles.

6. **The drift state is the slow burn.** 6 of 18 encoded events have produced cumulative drift on the seven constitutional axes. The strongest drift is in `bumiputera_policy` and `judicial_power` — both pre-2008 effects. Post-2008 drift on `expression_restriction` is accelerating (CMA s.233, Sedition Act, proposed Akta Kedaulatan Raja). If C3 (3R defensive escalation) is played, this drift sharpens. The accumulated drift makes Malaysia's effective constitution in 2026 substantially different from 1957's text — and the cards available to the current government are CONSTRAINED by that drift.

## 5. Pressure points (where small changes have outsized engine effects)

From the engine output, three variables are the highest-leverage:

1. **PH-PN block status.** Every scenario assumes it holds. If it breaks (PH-Bersatu reconciliation, Mahathir-style realignment), the entire coalition arithmetic changes. Engine cannot predict whether the block breaks but can show what happens if it does.

2. **BN legal-exposure parameter (currently 0.85; post-pardon ~0.30).** This is the single parameter whose change most dramatically shifts BN's coalition preferences. C1 (Najib pardon) reduces it from 0.85 to 0.30. The engine treats post-0.30 BN as more comfortable in opposition or non-PH coalitions. This is the parameter to watch.

3. **Borneo Affairs Ministry concession.** C2 (concession given) shifts GRS/GPS effective legal_exposure to 0.5 (treating ministerial-status guarantee as ~equivalent patronage). The engine consequence: Borneo bloc locks more tightly into Unity Government, reducing PN's path to majority via Borneo-defection.

## 6. What the engine cannot tell us — read editorially

These are the limits the brief author must respect:

- **Foreign-policy shocks.** China-Malaysia chip-deal collapse, US sanctions exposure, Saudi-Iran proxy effects — engine has no representation.
- **Intra-party leadership crises.** Anwar's succession, Zahid's UMNO rivals, PAS post-Hadi — engine treats coalitions as monolithic.
- **Judicial intervention.** Federal Court rulings can reshape the institutional ground the engine assumes (e.g., a ruling that invalidates Article 54(1) carve-out would break C5).
- **Exogenous economic shocks.** Recession, ringgit collapse, commodity-price reversal — engine has crisis-indicators but no economic-cycle modelling.
- **The 3R surface.** Engine treats Race/Religion/Royalty institutionally; can NOT model theological correctness, royal personal preference, or community emotional response. Those remain editorial territory.

## 7. Editorial implications (what this means for T4A coverage)

Reading the cards together produces a real claim the engine surfaces that the dominant narrative under-weights:

> **The Unity Government's BN dependency is mechanically over-determined under nearly every card the incumbent can play. The Najib-pardon card, often framed as the decisive lever, produces less coalition-arithmetic change than the political theatre around it suggests; its real consequence is the longer-run shift in BN's coalition preferences once Court Cluster patronage no longer binds them. The fight worth watching is whether the PH-PN block holds — that is the single binary that flips the entire arithmetic, far more than any single card.**

This is the kind of structural reframe T4A's editorial brand exists to surface: not who wins the news cycle, but what's mechanically determined.

