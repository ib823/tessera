# GE16 Forward Scenarios — Engine Output

**Status:** internal T4A — NOT for publication as numerical claims (per design doc §8.3).
**Generated:** 2026-05-21T07:30:33.506Z
**Engine:** 5-mechanism pipeline (outbidding -> electoral -> coalition -> patronage -> royal)

## What this report is, and is not

This is a **structural reading** of six hand-curated vote-share scenarios.
It is NOT a forecast. The numbers should be read as *if-then* relationships:
**if** the vote shares fall as described, **then** the engine's mechanism
modules would route the coalition arithmetic as shown.

Known calibration limitations (from `sim-backtest-elections.mjs`):

- PAS seats systematically over-predicted (rural-bias model can't capture
  regional concentration; PAS's vote-to-seat conversion is poor outside
  the northern heartland).
- BN seats systematically under-predicted in dominant-party periods
  (base-erosion / incumbency not modelled).
- Mean MAPE across GE12-15 is 30.3%; only GE15 passes the 25% threshold.

Treat the outputs as a **disciplined reading of the natural coalition family**
for each scenario, not as numerical predictions. Each scenario's qualitative
answer is more reliable than its specific seat counts.

## Scenarios

### Scenario A — Status Quo

**Theory of change:** GE15 vote shares preserved. Baseline for comparison.

**Vote shares (assumed):**

| Party | Vote % |
|---|---:|
| PH | 37.4% |
| PN | 30.4% |
| BN | 22.4% |
| GPS | 6.0% |
| GRS | 2.0% |
| Warisan | 1.5% |
| MUDA | 0.3% |

**Engine output:**

Predicted seat distribution:

| Party | Predicted seats | Share |
|---|---:|---:|
| PH | 78 | 35.1% |
| PN | 74 | 33.3% |
| BN | 44 | 19.8% |
| GPS | 17 | 7.7% |
| GRS | 5 | 2.3% |
| Warisan | 3 | 1.4% |
| MUDA | 1 | 0.5% |

Top-3 PH-led coalition candidates (formateur = PH):

| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |
|---:|---|---:|---:|---:|---:|
| 1 | BN+GRS+PH+Warisan | 130 | 0.206 | 0.78 | 54 |
| 2 | BN+PH+Warisan | 125 | 0.202 | 0.75 | 52 |
| 3 | BN+GPS+GRS+PH+Warisan | 147 | 0.198 | 0.80 | 56 |

**Royal intervention:** did not fire (crisis 0.00, below threshold). Natural coalition stands.

---

### Scenario B — Najib Pardon

**Theory of change:** Najib receives full pardon between now and GE16. UMNO grassroots return to BN; some PN-leaning Malay voters shift back to BN; reformist PH voters partly demobilize.

**Notes:** BN +5.8pp (recovers ~half of post-2018 lost Malay vote). PN -2.9pp. PH -2.4pp.

**Vote shares (assumed):**

| Party | Vote % |
|---|---:|
| PH | 35.0% |
| PN | 27.5% |
| BN | 28.2% |
| GPS | 6.0% |
| GRS | 2.0% |
| Warisan | 1.0% |
| MUDA | 0.3% |

**Engine output:**

Predicted seat distribution:

| Party | Predicted seats | Share |
|---|---:|---:|
| PH | 74 | 33.3% |
| PN | 67 | 30.2% |
| BN | 56 | 25.2% |
| GPS | 17 | 7.7% |
| GRS | 5 | 2.3% |
| Warisan | 2 | 0.9% |
| MUDA | 1 | 0.5% |

Top-3 PH-led coalition candidates (formateur = PH):

| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |
|---:|---|---:|---:|---:|---:|
| 1 | BN+GRS+PH+Warisan | 137 | 0.206 | 0.78 | 54 |
| 2 | BN+PH+Warisan | 132 | 0.203 | 0.75 | 53 |
| 3 | BN+GPS+GRS+PH+Warisan | 154 | 0.198 | 0.80 | 57 |

**Royal intervention:** did not fire (crisis 0.00, below threshold). Natural coalition stands.

---

### Scenario C — PN Green Wave Continues

**Theory of change:** PAS-Bersatu extend their northern-belt sweep; subsidy fatigue and 3R framing harden Malay support; UMNO grassroots stay with PN.

**Notes:** PN +7.6pp. BN -4.4pp. PH -2.9pp. The 'green wave' scenario from the PN-aligned think-tanks.

**Vote shares (assumed):**

| Party | Vote % |
|---|---:|
| PH | 34.5% |
| PN | 38.0% |
| BN | 18.0% |
| GPS | 6.0% |
| GRS | 2.0% |
| Warisan | 1.2% |
| MUDA | 0.3% |

**Engine output:**

Predicted seat distribution:

| Party | Predicted seats | Share |
|---|---:|---:|
| PH | 71 | 32.0% |
| PN | 91 | 41.0% |
| BN | 35 | 15.8% |
| GPS | 17 | 7.7% |
| GRS | 5 | 2.3% |
| Warisan | 3 | 1.4% |

Top-3 PH-led coalition candidates (formateur = PH):

| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |
|---:|---|---:|---:|---:|---:|
| 1 | BN+GRS+PH+Warisan | 114 | 0.209 | 0.78 | 52 |
| 2 | BN+GPS+GRS+PH+Warisan | 131 | 0.200 | 0.80 | 55 |
| 3 | BN+GPS+PH+Warisan | 126 | 0.197 | 0.77 | 53 |

PN-led alternative formateur (if PH cannot form):

- GPS+GRS+PN (113 seats, weight 0.346)

**Royal intervention:** FIRED (crisis 0.73). Natural -> broadened:
- Natural: BN+GRS+PH+Warisan (114 seats)
- Broadened: BN+GPS+GRS+PH+Warisan (131 seats)
- Additions: GPS +17

---

### Scenario D — Subsidy Fatigue (Mild)

**Theory of change:** Cost-of-living + subsidy-rationalisation backlash erodes PH urban vote; BN holds; PN gains modestly. The non-Najib version of the anti-incumbent scenario.

**Notes:** PH -3.9pp. PN +2.6pp. BN +1.1pp. The most-likely scenario per recent polls.

**Vote shares (assumed):**

| Party | Vote % |
|---|---:|
| PH | 33.5% |
| PN | 33.0% |
| BN | 23.5% |
| GPS | 6.0% |
| GRS | 2.0% |
| Warisan | 1.7% |
| MUDA | 0.3% |

**Engine output:**

Predicted seat distribution:

| Party | Predicted seats | Share |
|---|---:|---:|
| PH | 70 | 31.5% |
| PN | 80 | 36.0% |
| BN | 46 | 20.7% |
| GPS | 17 | 7.7% |
| GRS | 5 | 2.3% |
| Warisan | 4 | 1.8% |

Top-3 PH-led coalition candidates (formateur = PH):

| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |
|---:|---|---:|---:|---:|---:|
| 1 | BN+GRS+PH+Warisan | 125 | 0.206 | 0.78 | 53 |
| 2 | BN+PH+Warisan | 120 | 0.202 | 0.75 | 52 |
| 3 | BN+GRS+PH | 121 | 0.198 | 0.73 | 51 |

PN-led alternative formateur (if PH cannot form):

- BN+PN (126 seats, weight 0.343)

**Royal intervention:** did not fire (crisis 0.00, below threshold). Natural coalition stands.

---

### Scenario E — Najib Pardon + Modest PN Hold

**Theory of change:** Composite of B and C-lite: BN recovers via Najib goodwill, PN holds rather than collapsing, PH drops more sharply. The unity-government-loses scenario.

**Notes:** Three-way close finish at the federal level. Highest hung-parliament probability.

**Vote shares (assumed):**

| Party | Vote % |
|---|---:|
| PH | 32.0% |
| PN | 32.0% |
| BN | 27.5% |
| GPS | 6.0% |
| GRS | 2.0% |
| Warisan | 1.2% |
| MUDA | 0.3% |

**Engine output:**

Predicted seat distribution:

| Party | Predicted seats | Share |
|---|---:|---:|
| PH | 66 | 29.7% |
| PN | 77 | 34.7% |
| BN | 53 | 23.9% |
| GPS | 17 | 7.7% |
| GRS | 5 | 2.3% |
| Warisan | 3 | 1.4% |
| MUDA | 1 | 0.5% |

Top-3 PH-led coalition candidates (formateur = PH):

| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |
|---:|---|---:|---:|---:|---:|
| 1 | BN+GRS+PH+Warisan | 127 | 0.206 | 0.78 | 53 |
| 2 | BN+PH+Warisan | 122 | 0.202 | 0.75 | 52 |
| 3 | BN+GPS+GRS+PH+Warisan | 144 | 0.198 | 0.80 | 56 |

PN-led alternative formateur (if PH cannot form):

- BN+PN (130 seats, weight 0.342)

**Royal intervention:** did not fire (crisis 0.00, below threshold). Natural coalition stands.

---

### Scenario F — Rafizi PBM Spoils

**Theory of change:** Parti Bersama Malaysia (Rafizi/Nik Nazmi 2026) splits reformist urban PH vote in Klang Valley. PH loses pivotal urban-Selangor seats by margin smaller than PBM's vote.

**Notes:** PBM 3.2pp drawn primarily from PH urban-reform base. Spoiler-effect dynamics.

**Vote shares (assumed):**

| Party | Vote % |
|---|---:|
| PH | 33.0% |
| PN | 31.0% |
| BN | 23.0% |
| GPS | 6.0% |
| GRS | 2.0% |
| Warisan | 1.5% |
| PBM | 3.2% |
| MUDA | 0.3% |

**Engine output:**

Predicted seat distribution:

| Party | Predicted seats | Share |
|---|---:|---:|
| PH | 69 | 31.1% |
| PN | 75 | 33.8% |
| BN | 45 | 20.3% |
| GPS | 17 | 7.7% |
| GRS | 5 | 2.3% |
| Warisan | 3 | 1.4% |
| PBM | 7 | 3.2% |
| MUDA | 1 | 0.5% |

Top-3 PH-led coalition candidates (formateur = PH):

| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |
|---:|---|---:|---:|---:|---:|
| 1 | BN+GRS+PH+Warisan | 122 | 0.206 | 0.78 | 53 |
| 2 | BN+PH+Warisan | 117 | 0.203 | 0.75 | 52 |
| 3 | BN+GPS+GRS+PH+Warisan | 139 | 0.198 | 0.80 | 55 |

PN-led alternative formateur (if PH cannot form):

- BN+PN (120 seats, weight 0.342)

**Royal intervention:** did not fire (crisis 0.01, below threshold). Natural coalition stands.

---

## Cross-scenario synthesis

Reading the six scenarios together, four structural findings:

1. **PH's coalition arithmetic is structurally fragile.** In every scenario
   evaluated, PH alone reaches at most 78 seats — below the 112-seat
   majority threshold. PH cannot govern alone in any plausible vote-share
   distribution; the natural PH-led coalition always requires at least one
   additional partner.

2. **BN is in every PH-led natural coalition (all 6 of 6 scenarios).** Because PH alone
   is short of majority and the PH-PN block holds, BN is the only large party
   PH can pair with that the engine sees as ideologically reachable. BN's
   Court Cluster legal-exposure (encoded as 0.85 in the patronage module)
   reinforces this: BN's value-of-being-inside is structurally elevated.
   The Unity-Government coalition family is, by the engine's read,
   OVER-determined under current institutional constraints.

3. **Royal intervention is mechanically redundant in these scenarios**
   (1 of 6 fired). Because the natural PH-led coalition already
   absorbs BN out of arithmetic necessity, the resulting coalition has
   sufficient seat margin above the 50%+7% stability buffer to make royal
   broadening unnecessary. This is itself a finding: the engine reads the
   GE15 Unity Government as a coalition-logic outcome, not a royal-
   arbitration outcome — even though the historical narrative emphasises
   the royal role.

4. **PN-led alternative formateur is mechanically possible in 4 of 6 scenarios.**
   When PN has more predicted seats than PH (B Najib Pardon, D Subsidy
   Fatigue, E Combined, F PBM Spoils), an alternative formateur path opens
   through PN+BN. The engine cannot decide between PH-led and PN-led — both
   are mechanically winning. The historical choice has been made by royal
   selection of formateur (2022 GE15) and by Court Cluster patronage
   incentive (BN preferred PH for AGC arithmetic). Both of those are
   exogenous to the coalition module and would need explicit modelling to
   produce a single answer.

## Pressure-points for editorial

Where small changes have outsized engine effects (per §8.1 pressure-point
map):

- **The PH-PN block.** Every scenario assumes it holds. If it broke (e.g.,
  PH-Bersatu reconciliation, a Mahathir-style realignment), the entire
  coalition arithmetic changes. The engine cannot predict whether the block
  breaks, but it can show what happens if it does.

- **BN's legal-exposure parameter (currently 0.85).** If Najib gets a full
  pardon and Zahid's DNAA holds, BN's legal exposure could drop toward 0.3,
  reducing the patronage incentive to stay inside government. This would
  shift BN's preference toward independence (BN-solo) or alternative partner
  (BN-PN reunion).

- **Borneo bloc preferences.** GPS+GRS hold 29 seats federally. The engine
  treats them as approximately status-quo in every scenario, but their
  Borneo Affairs Ministry demand (T4A issue 1705) is a leverage point that
  could shift their alignment if Anwar concedes or refuses.

## What this report does NOT do

- It does NOT predict who will win GE16.
- It does NOT assign probabilities to scenarios.
- It does NOT incorporate exogenous shocks (foreign policy, scandals,
  deaths, royal action) that the engine cannot model with current data.
- It does NOT capture the Borneo regional-concentration effect that the
  electoral mechanism systematically under-predicts.

Use as a starting point for editorial reasoning, not as a finished answer.
