# Malaysia Political Simulation Engine — Foundations

**Companion to** `malaysia-political-intelligence.md`, `malaysia-new-party-strategy.md`
**Status:** internal T4A design document, careful read
**Author convention:** **[HIGH]** = primary-source documented; **[MED]** = widely-reported, multiple sources; **[LOW]** = estimate, inference, or theoretical claim flagged for verification
**Scope:** the theoretical, mathematical, and computational foundation for an in-house engine that can simulate Malaysian political dynamics from the Melaka Sultanate (≈1400) to the present, generate calibrated forward forecasts, and answer counterfactual queries.

---

## 0. Purpose and Epistemic Posture

### 0.1 What this engine is for

T4A publishes editorial issues that ask "what is missing from the mainstream frame?" That question has two failure modes. The first is **under-reach**: we miss a structural fact that would have changed the framing. The second is **over-reach**: we make an inference our evidence does not support. The simulation engine exists to discipline both. It is a *generator of counterfactuals* and a *consistency checker on causal claims*, not an oracle.

Concretely, the engine answers questions of four kinds:

1. **Backward causal:** "Given what happened between t₀ and t₁, which mechanism best explains it?"
2. **Forward distributional:** "Given the state at t, what is the probability distribution over outcomes at t+Δ?"
3. **Counterfactual:** "If actor a had taken action a' instead of a, how does the outcome distribution shift?"
4. **Pressure-point:** "Where in the state vector does a small perturbation produce a large outcome change?"

The engine is **internal**. Outputs are inputs to editorial judgement, never published as numerical predictions. The reason is given in §0.3.

### 0.2 Epistemic commitments

The engine is **probabilistic**, **calibrated**, and **falsifiable**. It commits to:

- Reporting outcomes as distributions with explicit credible intervals, never point predictions.
- Separating data-grounded claims from theoretically-inferred claims at every output.
- Pre-registering forward predictions in `engine/sim/forecasts/{date}.json` before observed outcomes are known, so backtests are honest.
- Reporting Brier scores and calibration plots quarterly, and publishing them (internally) when they get worse.

It rejects:

- **Spurious precision.** A 73% probability claim is dishonest if the model uncertainty is ±15%. Quantities are rounded to the precision they actually have.
- **Whig history.** Path dependence is not destiny. Counterfactuals must be runnable at every node.
- **Ethnic essentialism.** Cleavages are situational variables, not biological constants. The Bumiputera bloc of 1957 is not the Bumiputera bloc of 2026 — it is a coalition produced by specific institutional arrangements that the engine must model explicitly.
- **3R theological reasoning.** Royalty and religion are treated as *institutional* and *legitimacy* variables. The engine never simulates theological correctness or royal personal character; it simulates the structural role of these institutions in coalition formation, legitimation, and legitimacy shock.

### 0.3 What this engine cannot do

No political simulator survives contact with reality if it claims more than this list:

- **Black swans:** assassinations, foreign military shocks, pandemics, climate disasters. The engine treats these as exogenous shock priors with broad-tailed distributions; it does not predict their timing.
- **Genuine sovereign discretion:** the YDPA's personal judgement, individual breaks in elite psychology. The engine models the *frequency and pattern* of royal interventions but not which specific intervention will occur on which date.
- **Single-outcome certainty:** any claim of the form "X will happen by Y date with certainty p > 0.9" outside very short horizons (≤30 days) is a sign of overfitting, not knowledge.

The engine is **honest about what it does not know**. When uncertainty is wide, it says so.

---

## 1. Periodization: 1400–2026

Different periods have different generating mechanisms. A single time-invariant model would average across regime types and yield nothing. We partition the history into eight periods, each with a characteristic **selectorate**, **dominant cleavage**, **legitimation logic**, and **veto-player configuration**.

| Period | Years | Selectorate | Dominant cleavage | Legitimation | Veto players |
|---|---|---|---|---|---|
| **P1** Sultanate | ≈1400–1786 | Sultan + bendahara + orang kaya | Dynastic + religious | Daulat (sacral sovereignty) + Islam | Sultan, bendahara, religious authority |
| **P2** Colonial indirect rule | 1786–1957 | Resident + Sultans (nominal) + planter capital | Communal-economic (CIRC ↔ rural Malay) | Imperial + treaty-bound | Resident, Sultans, MCS |
| **P3** Alliance consociational | 1957–1969 | UMNO Supreme Council + Alliance leaders | Ethnic (Alliance pact) | Constitutional + elections | Alliance partners, Conference of Rulers, civil service |
| **P4** NEP / BN hegemony | 1969–1998 | UMNO + BN partners + senior bureaucracy | Ethnic-economic restructuring | NEP performance + electoral | UMNO president, GLC chiefs, Sultans on key matters |
| **P5** Reformasi era | 1998–2008 | Same + emergent civil society | Reform vs status quo | Increasingly contested | UMNO, judiciary (post-1988 crisis), Sultans |
| **P6** Tipping | 2008–2018 | + organised opposition + diaspora capital | Reform vs status quo, intra-Malay | Electoral + procedural | + Federal Court, + opposition coalitions |
| **P7** Hybrid instability | 2018–present | All of the above + royal arbitration | Multiple, oscillating | Procedural + royal | + YDPA + Conference of Rulers (active) + GRS-GPS bloc |

Each period has its own transition kernel. The engine's regime layer (§5) is itself a small Markov chain over these eight states.

### 1.1 Continuities the periodization preserves

Persistent across all eight periods (these are the *invariants* the engine encodes):

1. **Daulat-based legitimation.** Even under colonial rule, the Resident system was anchored on Sultans as nominal sovereigns. Post-2018 royal interventions reactivate a logic older than the Constitution.
2. **Ethnic accommodation through institutional carveouts.** The 1948 Federation Agreement, the 1957 Reid bargain, Article 153, NEP, NDP, NEM, Bumiputera Economic Transformation, PuTERA35 — all variants of the same mechanism (issue 1626 documents how the phrase "social contract" itself is constitutional narrative, not text).
3. **Patronage flows tied to office-holding.** Sultanate-era trade monopolies, colonial concessions, post-independence GLC chairmanships, 2025-era 238 political appointments to GLIC boards (issue 1986) — same mechanism, different vessels.
4. **The arbitrating outsider.** Bendahara, Resident, Tunku, Mahathir-1.0, YDPA, Conference of Rulers. The position rotates; the role persists.

### 1.2 Critical junctures the periodization marks

Transitions between periods are **critical junctures** in Pierson's (2004) sense: moments where path dependence is broken and a new attractor basin opens.

- **1786 (Penang cession):** colonial entry; pluralism enters by labor migration.
- **1874 (Pangkor):** Resident system formalised; daulat preserved, sovereignty reassigned.
- **1957 (Independence):** Article 153, Alliance template, consociational pact.
- **1969 (13 May):** consociational equilibrium breaks; NEP reconstitutes it on coercive terms.
- **1988 (judicial crisis):** Federal Court neutered; constitutional review weakens.
- **1998 (Reformasi):** Anwar sacking; opposition mobilises around procedural justice.
- **2008 (denial of two-thirds):** electoral attractor shifts.
- **2018 (GE14):** BN defeated; hybrid regime begins.
- **2020 (Sheraton Move):** elected coalition replaced extra-electorally; royal arbitration normalised.
- **2022 (hung parliament):** YDPA selects PM; coalition arithmetic permanently changed.

Each junction has documented event records that can be encoded as **regime-change observations** for calibrating the transition matrix.

---

## 2. Theoretical Foundations

The engine synthesises five proven theoretical frameworks. None is sufficient alone; each is the right tool for a specific layer.

### 2.1 Consociational democracy (Lijphart 1969, 1977)

Malaysia is a canonical "modified consociational" case. The four Lijphart features map directly:

- **Grand coalition:** Alliance (1957), BN (1973), PN (2020), Unity Govt (2022).
- **Mutual veto:** 3R as the constitutionalised veto on policy that threatens any communal core interest.
- **Proportionality:** ethnic quotas in cabinet, civil service, GLC boards, university intake.
- **Segmental autonomy:** vernacular schools, syariah jurisdiction, state autonomy.

But Malaysia also has **majoritarian** features (FPTP, dominant-party logic) and **hybrid-regime** features (uneven playing field). The engine therefore uses Lijphart for *coalition logic* and Levitsky-Way (§2.5) for *electoral logic*.

**Mathematical use:** consociational stability is a function of intra-coalition portfolio satisfaction. If actor i's expected portfolio payoff Eπᵢ falls below a defection threshold τᵢ, the coalition is fragile.

### 2.2 Selectorate theory (Bueno de Mesquita et al. 2003)

For each regime state, define:

- **N** = nominal selectorate (everyone formally able to participate)
- **S** = real selectorate (those who actually can influence leader selection)
- **W** = winning coalition (those who must be kept satisfied)

Two ratios drive predictions:

- **W/S**: low → autocratic logic (private goods to W); high → democratic logic (public goods).
- **W/N**: legitimacy strain. Low W/N with high N → regime instability if N can coordinate.

Malaysia's W/S trajectory across periods (engine's estimated values, [LOW] until back-fitted):

| Period | N | S | W | W/S |
|---|---|---|---|---|
| P4 (NEP/BN) | ~10⁷ | ~3×10⁵ | ~5×10³ | 0.017 |
| P6 (tipping) | ~1.5×10⁷ | ~1×10⁶ | ~3×10⁴ | 0.030 |
| P7 (hybrid) | ~2×10⁷ | ~2×10⁶ | ~1×10⁵ | 0.050 |

W is rising. The engine predicts (and the data confirms via issue 1023 on tripled GLIC appointments) that **private-goods provision must grow faster than W to maintain coalition cohesion**. When it doesn't, coalitions fragment.

### 2.3 Veto-player theory (Tsebelis 1995, 2002)

Policy change requires the assent of every veto player; policy stability rises with the number of veto players and their ideological distance.

For Malaysia we identify:

- **Institutional veto players:** YDPA, Conference of Rulers, Federal Court, Dewan Negara, state assemblies on State List matters.
- **Partisan veto players:** each coalition party with enough seats to bring down the government.

The post-2018 system has **strictly more veto players** than the pre-2018 system. Tsebelis predicts this produces **stability of dysfunction**: reforms that have been promised for decades (Sedition Act repeal — issues 1980, 1991; political-financing reform — issue 1944; IPCC; civil-society oversight of MACC — issue 1961) all stalled. The engine matches this pattern.

**Mathematical use:** define a policy space P. For policy p to pass, p must lie in the intersection of all veto players' acceptance sets Aᵢ. The "core" C = ∩ᵢ Aᵢ shrinks as veto players proliferate. When C is empty, no policy change occurs.

### 2.4 Ethnic outbidding (Horowitz 1985, Rabushka-Shepsle 1972)

In divided societies with mono-ethnic parties, intra-ethnic competition drives ethnic claims toward extremes. UMNO ↔ PAS for the Malay vote is the textbook case: each move by one toward greater ethnic-religious assertion forces the other to match.

Stable outcomes require either:

- **Institutional dampening** (consociational arrangements that reward inter-ethnic moderation), OR
- **Cross-cutting cleavages** (class, region, or generation that bind across ethnicity).

Malaysia has weak versions of both. The engine therefore predicts persistent outbidding cycles — confirmed by the 1980-1991-1999 cluster (Zahid's "firmer law on insults", Harmony Bill stall, Daulat Tuanku rally).

**Mathematical use:** for two parties A, B competing for vote share v in cleavage c, dv/dt for party A depends on the *gap* between A's position and B's on the salient cleavage axis. The equilibrium is corner (extreme position) unless damped.

### 2.5 Hybrid regime theory (Levitsky-Way 2002, 2010)

Competitive authoritarianism: real competition, uneven playing field, weak procedural protections, regular elections, opposition can in principle win. Malaysia 1981–2018 is a near-perfect case. Post-2018 it is **drifting** but uncertainly:

- **Toward democracy:** GE14 alternation, federal court independence on Nik Elin (issue 1618), MACC charging recommendations.
- **Toward semi-authoritarianism:** CMA s.233 10× penalty hike (issue 1980), Sedition Act doubling, Akta Kedaulatan Raja proposal (issue 1999), anti-hopping anti-defection back doors (issue 1993).

The engine maintains a continuous **liberalisation index** L(t) ∈ [0,1] updated from observed events; transitions in either direction are modelled as a stochastic process with a calibrated drift.

### 2.6 Path dependence and critical junctures (Pierson 2000, Mahoney 2000)

Self-reinforcing institutions produce increasing returns. Critical junctures break the pattern. The engine's regime-state Markov chain (§5) is the formalisation of this.

**Mathematical use:** for state s, define **persistence probability** P(sₜ₊₁ = s | sₜ = s) > 0.9 in non-juncture periods. Junctures are states where this drops to ≈0.5, releasing the system into a basin of attraction determined by exogenous shocks and elite alignment.

### 2.7 What we deliberately do not use

- **Modernisation theory** (Lipset 1959). Fails to explain Malaysia's resilience to democratic transition at every income threshold.
- **Rational-actor full-information game theory.** Computationally intractable and empirically wrong. We use bounded-rationality ABM instead (§5.2).
- **Cultural-essentialist explanations** ("Asian values", "tudung index"). Reject on epistemic grounds.
- **Single-cleavage class models** (orthodox Marxian). Underpredicts ethnic salience.

---

## 3. Ontology

The engine's data model. All schemas live in `engine/sim/schema/*.json` (to be created in build Phase 2).

### 3.1 Actors

```
IndividualActor {
  id: string                     // ULID
  canonical_name: string         // "Najib Razak"
  aliases: string[]              // ["Mohd Najib bin Abdul Razak", "Bossku"]
  born: ISO-date | null
  died: ISO-date | null
  cleavage_attributes: {
    ethnic: string
    religious: string
    regional: string
    class_origin: string         // estimated from family business records
    generation: integer
  }
  role_history: [
    { office: string, from: ISO-date, to: ISO-date, regime_period: P1..P7 }
  ]
  network_edges: [
    { other_id, edge_type: family | patron | client | rival | ally, weight, period }
  ]
  estimated_preferences: {
    survival_weight: 0..1        // own political survival
    coalition_weight: 0..1       // coalition stability
    ideology_weight: 0..1        // policy preferences
    legacy_weight: 0..1
  }
  resource_endowment_history: [...]
}

CollectiveActor {
  id, canonical_name, founded, dissolved | null,
  type: party | communal_bloc | royal_household | institutional |
        civil_society | business | foreign_state,
  member_ids: string[],
  doctrinal_position: VectorInIdeologySpace,
  cohesion_index: 0..1            // historical splits, defections per year
  resource_pool: ResourceVector
}

InstitutionalActor {
  id, canonical_name,
  formal_powers: ConstitutionalArticleRef[],
  informal_norms: string[],
  period_active: [from, to | null],
  current_legitimacy_index: 0..1
}
```

### 3.2 Events

```
Event (abstract) {
  id, date_start, date_end | null,
  period: P1..P7,
  primary_sources: SourceRef[]     // ≥1 PRIMARY for inclusion
  confidence: HIGH | MED | LOW
  actors_involved: ActorRef[],
  cleavages_activated: CleavageRef[],
  legitimacy_delta: { institution_id: ±delta }   // signed change
}
```

The taxonomy is **closed**. Any historical event must fit one of 16 types, specified in **ADR-0005**:

`Election`, `LegislativeVote`, `ConstitutionalAmendment`, `RoyalIntervention`, `CoupOrAttempt`, `Protest`, `TrialVerdict`, `PolicyAnnouncement`, `ScandalRevelation`, `ResourceTransfer`, `DiscursiveEvent`, `DemographicShift`, `ElitePersonnelChange`, `InstitutionalCreation`, `CoalitionFormation`, `ExogenousShock`.

If an event does not fit any of the 16, the taxonomy is wrong and gets updated by a new ADR. See ADR-0005 for the rationale on the additions beyond the original 11.

### 3.3 Institutions and rules

```
Institution {
  id, canonical_name,
  rule_set: Rule[]
}

Rule {
  id,
  type: formal | informal,
  text_or_description: string,
  legal_source: ConstitutionalArticle | Statute | CaseLaw | Convention,
  enforcement_mechanism: string,
  observed_compliance_rate: 0..1   // empirical
}
```

Article 42 (royal pardon), Article 54(1) (vacant seats), Article 153 (special position), Article 159 (amendment), Article 181 (Rulers' position), Eighth Schedule §4(1) (state assembly composition) — each is one Rule object.

### 3.4 Cleavages

```
Cleavage {
  id, name,
  axis: ordinal | categorical,
  values: string[],   // e.g. ["Bumiputera", "Chinese", "Indian", "Other"]
  salience_history: [ { date, salience: 0..1 } ]
}
```

Salience is time-varying and event-driven (the 13 May 1969 datapoint sets ethnic salience to ≈1; the 2008 GE12 datapoint sets reform-vs-status-quo salience to ≈0.7).

### 3.5 Resources

```
ResourceVector {
  votes: { constituency_id: count }
  money: { actor_id: amount_RM }   // budget, GLC, patronage, illicit (separate fields)
  force: { actor_id: personnel | weapons_class }
  legitimacy: { source: 0..1 }     // royal, religious, electoral, procedural, performance
  information: { actor_id: media_reach_estimate }
}
```

### 3.6 Source hierarchy

Every event datapoint carries a `primary_sources[]` array of `SourceRef`. Sources are tiered:

- **Tier 1 (primary):** gazettes, court rulings, EC records, Hansard, royal proclamations, audit reports, regulator filings.
- **Tier 2 (authoritative secondary):** wire-service reports citing Tier 1, peer-reviewed journals, INSAP/IDEAS/ISIS papers.
- **Tier 3 (corroborative):** mainstream press, memoir.
- **Tier 4 (background):** general commentary, social media.

An event is **encodable** only if it has ≥1 Tier 1 source, OR ≥2 Tier 2 sources, OR ≥1 Tier 2 plus ≥2 Tier 3. Tier 4 is never sufficient. This is stricter than T4A's editorial source standard because the engine is computing over the data, not just citing it.

---

## 4. Mathematical Structure

The engine is a layered stochastic process. The formal structure below is *the contract* between the design and the implementation; every module must conform.

### 4.1 State space

At time t, the system state is

```
Sₜ = (Pₜ, Rₜ, Cₜ, Dₜ, Lₜ, ρₜ)
```

where:

- **Pₜ** ∈ Positions: who holds which office (vector indexed by office)
- **Rₜ** ∈ Resources: resource distribution across actors
- **Cₜ** ∈ ℝᵏ: cleavage salience vector (k cleavages)
- **Dₜ** ∈ Δ(Frames): discourse state (distribution over active frames)
- **Lₜ** ∈ [0,1]ᵐ: legitimacy index for each of m institutions
- **ρₜ** ∈ {P1, …, P7}: regime period label

### 4.2 Transition kernel

```
Sₜ₊₁ = f(Sₜ, Aₜ, εₜ)
```

with:

- **Aₜ**: vector of actor actions sampled from each actor's policy πᵢ(· | Sₜ, Iᵢ(Sₜ))
- **Iᵢ(Sₜ)**: actor i's information set (what i observes about S)
- **εₜ**: exogenous shock, drawn from a heavy-tailed prior calibrated to historical shock frequency
- **f**: deterministic where institutional rules apply, stochastic where political contestation does

f decomposes:

```
f = f_institutional ∘ f_political ∘ f_exogenous
```

f_institutional: applies formal rules (election results → seat allocation, vote count → bill outcome). Deterministic.

f_political: applies the seven mechanism modules (§5.3). Stochastic.

f_exogenous: applies shock realisations.

### 4.3 Actor utilities

Each actor i has utility

```
Uᵢ(S) = wᵢ^survival · 𝟙[i ∈ office]
      + wᵢ^coalition · cohesion(S, i's coalition)
      + wᵢ^ideology · -‖S.position - i.ideal‖
      + wᵢ^legacy · long-run-influence(i, S)
      + wᵢ^material · material-payoff(i, S)
```

with weights wᵢ summing to 1, estimated per actor from documented behavior.

### 4.4 Bounded rationality

We do **not** solve for subgame-perfect equilibrium. Each actor uses a heuristic policy:

```
πᵢ(a | S) ∝ exp( β · Q̂ᵢ(S, a) )
```

where Q̂ᵢ is i's *estimated* action value, computed by:

1. Imitation: weighted average of what similar actors did in similar past situations.
2. Local search: small perturbations around current action.
3. Resource constraint: only feasible actions.

β is a rationality parameter, calibrated per actor (high for institutional actors with staff, low for crisis-response actions).

### 4.5 Bayesian belief update

For each public group g (e.g., urban Chinese voters, rural Malay voters, civil servants), posterior over policy positions and party trustworthiness:

```
Pₜ₊₁(θ | g) ∝ Pₜ(θ | g) · L(eventₜ | θ, frame_dominantᵍₜ)
```

The likelihood L is frame-conditional: the same event lands differently depending on which frame is dominant for the group at the time. Frame dominance shifts via §5.3.

### 4.6 Causal DAG

A directed acyclic graph G = (V, E) where vertices are state variables and edges are theorised causal relationships. Encodes our theoretical commitments and is used for counterfactual inference (Pearl's do-calculus).

Example fragment:

```
Patronage_shortfall → Defection_risk → Coalition_fragility → Royal_arbitration
                                              ↓
                                      Vote_of_no_confidence
```

Confounders identified and adjusted for. Where adjustment is impossible (unobserved variables), the engine flags the counterfactual as unidentifiable.

### 4.7 Regime-state Markov chain

A small Markov chain over the seven regime periods P1–P7 (plus terminal absorbing states for hypothetical futures: democratic consolidation, semi-authoritarian regression, federal disintegration). Transition probabilities calibrated from the 10 documented junctures (§1.2). Because n is small, transition probabilities have wide credible intervals — explicitly reported.

### 4.8 Composition

The full step is:

```
For each t:
  1. Sample exogenous shock ε_t
  2. Sample each actor's action a_i from π_i(·|S_t)
  3. Apply f_institutional to compute mandatory consequences
  4. Apply f_political mechanisms in order (§5.3)
  5. Update belief posteriors for each public group
  6. Update salience vector C_{t+1}
  7. Check regime-transition trigger; if fired, sample new ρ
  8. Emit S_{t+1}
```

Repeat for N=10,000 Monte Carlo trajectories. Aggregate to outcome distributions.

---

## 5. Mechanisms (the engines under the engine)

Seven mechanism modules. Each is a function `mechanism(S) → S'` with documented inputs, outputs, calibrated parameters, and a single named theoretical source.

### 5.1 Coalition formation

**Theoretical source:** Laver-Shepsle (1996) portfolio allocation; Riker (1962) minimum winning.

**Inputs:** parties' seat counts, ideological positions on k axes, prior alliances, blocked pairs (e.g., DAP-PAS).

**Process:** iterative offer-acceptance over portfolio allocations. Each potential formateur F proposes a coalition C and a portfolio split that maximises F's expected utility subject to all partners' acceptance constraints (Uᵢ(C, split) ≥ Uᵢ(best alternative)).

**Output:** coalition composition, portfolio assignments, expected duration.

**Calibration:** post-2018 coalition formation events (PH 2018, PN 2020, Unity 2022, Sabah 2025).

### 5.2 Ethnic outbidding

**Theoretical source:** Horowitz (1985), Coakley (2008).

**Inputs:** competing parties' positions on ethnic-salience axis, salient triggering event (court ruling, royal statement, communal incident).

**Process:** if parties A and B compete for the same ethnic vote share and an ethnic-salient event occurs, each party's next position update is biased toward the ethnic-assertive end by amount proportional to the gap from the more-assertive competitor.

**Damper:** coalition membership penalty — if A is in a multi-ethnic coalition, outbidding cost is higher.

**Output:** updated party positions, updated cleavage salience.

**Calibration:** UMNO-PAS positioning 1999–2024; tested against the 1980-1999 cluster.

### 5.3 Patronage allocation

**Theoretical source:** Hicken (2011) on clientelism; Magaloni (2006) on autocratic regimes.

**Inputs:** controller's resource pool, network of dependents, alternative-offer landscape, sunk loyalty costs.

**Process:** resources flow from controller c to dependent d along network edges weighted by:

- d's defection risk (estimated from alternative-offer landscape)
- d's marginal value to c (vote-mobilisation capacity, parliamentary support, etc.)
- c's resource constraint

Defection occurs when d's expected payoff from defecting exceeds expected payoff from loyalty + sunk-cost penalty.

**Output:** updated resource distribution, defection events, network re-wiring.

**Calibration:** documented defections (Bersatu 2020 splits, PKR 2025 Rafizi-Nik Nazmi, UMNO Court Cluster).

### 5.4 Royal intervention

**Theoretical source:** Bagehot's dignified-vs-efficient distinction adapted to constitutional monarchy in crisis; comparative case literature (Belgium 1990, Thailand 1992 and 2006).

**Inputs:** constitutional ambiguity, political crisis (failed coalition, hung parliament, scandal cascade), perceived elite consensus level, Conference of Rulers' deliberation state.

**Process:** the intervention probability is a function of (i) the constitutional opening (is there a discretionary article in play? Article 40(2), 43, 150, etc.), (ii) the magnitude of the crisis, (iii) the absence of a clearly legitimate political resolution path.

**Critical:** the engine models **frequency and form**, not who is intervening or what they "really" want. It assumes the institution responds to systemic pressure, not personal preference.

**Output:** intervention event, mechanism used (advice, refusal of assent, summoning, dissolution refusal, pardon), legitimacy delta to relevant institutions.

**Calibration:** Perak 2009, PH PM transition 2020, Sheraton 2020, Emergency 2021, GE15 PM selection 2022, Najib addendum 2024 (issue 1092).

**3R discipline:** the engine never models royal personal preference or theological correctness. Royal intervention is a *system-level response variable*, not an individual psychology variable.

### 5.5 Constitutional drift

**Theoretical source:** Levinson-Sachs (2015) on constitutional change without amendment; Tushnet on small-c constitutionalism.

**Channels of drift:**

1. **Amendment** (Article 159): requires 2/3 of both Houses. Rare. Tracked event-by-event.
2. **Federal Court interpretation:** Nik Elin (2024) on State List, Indira Gandhi on syariah jurisdiction. Tracked by case.
3. **Informal practice convention:** PM-chooses-CJ, DPM-from-largest-partner. Tracked by violation.
4. **State-level overreach:** Johor appointed assemblymen (issue 1977), Kelantan syariah re-enactment (issue 1618). Tracked by enactment.

**Process:** drift accumulates as a vector D(t) in constitutional-meaning space. Each channel contributes weighted by salience and finality.

**Output:** updated effective constitutional state, often diverging from textual constitution.

**Calibration:** the 14 amendments to Article 153 since 1957; Sedition Act trajectory; CMA s.233 amendment cascade.

### 5.6 Electoral cycle

**Theoretical source:** Cox (1997) strategic coordination; Lijphart electoral systems comparative.

**Inputs:** election schedule constraints (5-year max under Article 55), boundary delimitation cycle, party seat positions, voter preference distribution, malapportionment vector (see `malaysia-political-intelligence.md` §1).

**Process:** for each constituency, compute expected vote distribution per party using a hierarchical model (national swing × constituency type × demographic composition × candidate quality). Aggregate to seats using FPTP. Apply strategic-coordination correction (Duverger and its inverse).

**Output:** seat distribution, government-formation game initial condition.

**Calibration:** GE12 (2008), GE13, GE14, GE15, plus all state elections 2008–2025.

**Key parameter:** **swing-to-seat conversion ratio**, which in Malaysia is highly non-linear because of malapportionment. The engine encodes the 9:1 voter-weight ratio explicitly.

### 5.7 Crisis cascade

**Theoretical source:** Tainter (1988) on collapse; complex-systems criticality literature; Bak self-organised criticality.

**Inputs:** stressor (scandal, defection, court ruling, royal action), state fragility F(t) (a composite of coalition cohesion, legitimacy index, resource adequacy).

**Process:** for stressor of magnitude m on state with fragility F, cascade probability = σ(αm + βF − γ) where σ is logistic and (α, β, γ) are calibrated. When cascade fires, it propagates through coalition-fragility graph, triggering further defections/resignations/interventions.

**Output:** cascade event (which can include collapse to a new regime).

**Calibration:** Sheraton 2020, 1MDB revelations 2015–2018, Pakatan Rakyat dissolution 2015.

---

## 6. Simulation Architecture

### 6.1 Module layout

```
engine/sim/
├── schema/                    # JSON schemas for the ontology (§3)
│   ├── actor.schema.json
│   ├── event.schema.json
│   ├── institution.schema.json
│   ├── cleavage.schema.json
│   └── resource.schema.json
├── data/                      # encoded historical record
│   ├── actors/{period}/*.json
│   ├── events/{year}/*.json
│   ├── institutions/*.json
│   └── cleavages/*.json
├── mechanisms/                # the seven §5 modules
│   ├── coalition.mjs
│   ├── outbidding.mjs
│   ├── patronage.mjs
│   ├── royal.mjs
│   ├── drift.mjs
│   ├── electoral.mjs
│   └── cascade.mjs
├── core/
│   ├── state.mjs              # State Sₜ and update logic
│   ├── monte-carlo.mjs        # trajectory sampling
│   ├── bayes.mjs              # belief updates
│   ├── dag.mjs                # causal-DAG engine
│   └── markov.mjs             # regime chain
├── validation/
│   ├── backtest.mjs           # retrodict known outcomes
│   ├── calibration.mjs        # Brier scores, calibration plots
│   └── sensitivity.mjs
├── forecasts/                 # pre-registered forward predictions
│   └── {date}.json            # forecast + commit hash + resolution date
└── reports/                   # quarterly validation outputs
```

### 6.2 Pipeline

A simulation run is:

```
Run = {
  scenario: ForwardScenario | CounterfactualScenario | BacktestScenario,
  initial_state: S₀,
  intervention: do(X = x) | null,    // Pearl-style intervention
  horizon: integer (months),
  n_trajectories: integer (default 10000),
  seed: integer
}

Output = {
  trajectories: S₀ → S₁ → … → S_T  (one per Monte Carlo draw),
  outcome_distribution: histogram over outcome-of-interest,
  credible_interval: [lower, upper] at 90%,
  attribution: { mechanism_id: contribution_share },
  bifurcation_points: [{ t, variable, sensitivity }],
  unidentifiability_flags: string[]
}
```

### 6.3 Composition with T4A editorial pipeline

The engine integrates at three points:

1. **Phase 1 brief:** the engine can be queried for "what is the system context of this event?" Output goes into the brief's CONTEXT and RISK sections.
2. **Phase 5 synthesis (Stage 6):** the engine can check whether the editorial claim aligns with the engine's view of mechanism. Disagreement is a flag for Stage 6 to re-examine.
3. **Phase 7 Sherlock:** the engine's network module replaces or augments the current fact-graph for finding related issues.

The engine never **writes** card copy. It informs the writer; the writer commits.

---

## 7. Validation Protocol

A model that cannot be falsified is useless. The engine commits to four validation tracks.

### 7.1 Backtesting

For each documented critical juncture (1969, 1988, 1998, 2008, 2018, 2020, 2022), initialise the engine at t−1 and simulate to t+12 months. Report:

- Probability assigned to the observed outcome (higher = better).
- Brier score vs naive baseline (random, status-quo, expert consensus).
- Calibration plot (predicted probability bin vs observed frequency).

Pass bar: Brier score better than naive baseline at 90% confidence on a held-out test set.

### 7.2 Out-of-sample

Train on 1957–2007 (using §5 mechanism calibrations). Predict 2008–2018 (GE12, GE13, GE14, 1MDB cascade). Compare.

This is harsh — many parameters will be poorly identified on pre-2008 data because of regime-state change. Document failure modes explicitly.

### 7.3 Pre-registered forward forecasts

Every quarter, the engine emits a set of forward forecasts to `engine/sim/forecasts/{date}.json` with the git commit hash that produced them. After resolution (12–24 months), score them against observed outcomes. Publish (internally) calibration trends.

The list of mandatory forecast variables (initial set):

- GE16 timing (probability density over date)
- GE16 seat distribution per coalition (90% credible interval)
- Najib full-pardon-by-T probability for T ∈ {Dec 2026, Dec 2027}
- Sarawak state election timing and GPS seat share
- Borneo Affairs Ministry creation probability
- Coalition (Unity Govt) survival probability per quarter
- Sedition Act repeal probability by GE16
- Federal Court chief justice transition

Each forecast is a probability or distribution, NOT a point claim.

### 7.4 Expert elicitation comparison

Compare engine forecasts to expert panel forecasts (Merdeka Center, IDEAS, ISIS, INSAP polling). Engine should not systematically underperform a well-informed expert panel; if it does, the calibration is wrong.

### 7.5 Sensitivity analysis

For every output, report which parameters drive the result. If a conclusion depends on a parameter with wide credible interval, the conclusion inherits that interval.

---

## 8. Outputs and Editorial Use

### 8.1 Six output types

1. **System-context summary** for any current event: which mechanisms are active, what historical analogues apply, what the cleavage salience is.
2. **Counterfactual report:** "What if X had not happened?" — distribution over alternative trajectories, sensitivity to assumptions.
3. **Forecast distribution:** probability distribution over outcome of interest with explicit credible interval.
4. **Pressure-point map:** state variables where small changes have large effects → high-leverage editorial targets.
5. **Cleavage activation tracker:** current salience of each cleavage; helps Stage 6 calibrate framing.
6. **Attribution report:** for an observed outcome, which mechanisms contributed how much.

### 8.2 Reporting standards (internal)

Every engine output published to the writers must include:

- The query that produced it.
- The seed.
- The git commit of the engine at the time.
- Explicit credible intervals on all numerical claims.
- "Unidentifiable" flags where counterfactual identification fails.
- Sensitivity-of-conclusion-to-key-parameter table.

### 8.3 Never-publish list

The engine's outputs are NEVER published externally as numerical claims:

- "T4A's model says PN will win 84 seats" — never.
- "Engine forecasts 73% probability of Najib pardon" — never.
- "Simulation shows…" — never.

What is publishable is the underlying **structural reasoning** the engine helps surface: e.g., "the constitutional carve-out in Article 54(1) lets two seats sit empty until GE16" — that is a fact, not a model output. The engine helps writers find such facts. It does not authorise probability claims.

---

## 9. Cardinal Sins and Discipline

These are red lines. Any engine output that violates them is suppressed before reaching the writer.

### 9.1 Spurious precision

No probability claim to more than 2 significant figures. No credible interval narrower than the underlying data justifies. Numerical outputs must include sample-size / data-source provenance.

### 9.2 Ethnic essentialism

Cleavages are **modelled as situational, institutionally produced variables**, not biological constants. The engine MAY say "the Bumiputera vote bloc as institutionally defined since 1971 shows pattern X." It MAY NOT say "Malays vote this way." Every cleavage variable carries an institutional-history reference.

### 9.3 3R discipline

- **Race:** modelled as cleavage salience and institutional carve-out (Article 153, Bumiputera policy frameworks). Never modelled as inherent attribute.
- **Religion:** modelled as legitimacy source, regulatory framework (syariah jurisdiction, JAKIM), and salience variable. Never modelled theologically.
- **Royalty:** modelled as institutional actor with constitutional powers (Article 32, 40, 42, 150, 181) and as legitimacy source. Never modelled as individual psychology.

The engine output language must use *institutional* and *systemic* nouns, not communal or personal ones.

### 9.4 Whig history

Path dependence is *probabilistic* not deterministic. The engine must show counterfactual branches at every juncture. Outputs that read teleological ("Malaysia was destined to…") are violations.

### 9.5 Confirmation bias

All forward forecasts pre-registered. Backtests run on held-out data. Parameter changes that improve current-event fit must be justified against held-out data, not the current event being analysed.

### 9.6 Over-fitting

Parsimony penalty. Mechanism complexity must be justified by improved held-out performance. The engine prefers a 3-parameter mechanism that explains 80% of variance to a 12-parameter mechanism that explains 85%.

### 9.7 Reification

The engine produces representations, not reality. Outputs are model outputs. The map is not the territory. Where the model and observed reality diverge persistently, the model is wrong — never the reality.

---

## 10. Build Order

This document is **Phase 0**. The implementation roadmap:

**Phase 1 — Data schemas (1 week).** Write the JSON schemas in `engine/sim/schema/`. Define encoding standards. ADR for each non-obvious choice. (See ADR-0005 on event taxonomy.)

**Phase 2 — Historical event encoding, per ADR-0006 priority (4 weeks).** Block A (2008–2026, ≈800 events) plus Block B (pre-2008 boundary set, ≈80 events). Block C (full pre-2008) deferred to Phase 8. Each event encoded must satisfy the ADR-0005 source-tier requirement.

**Phase 3 — Actor profiles (2 weeks).** Encode ≈200 individual actors (federal politicians 2008–2026, key bureaucrats, Sultans, Conference of Rulers members, civil-society figures, business actors). Cross-reference with `malaysia-political-intelligence.md`.

**Phase 4 — Mechanism modules (one at a time, 1–2 weeks each).** Order: electoral → coalition → patronage → outbidding → drift → royal → cascade. Each module validated independently before composition.

**Phase 5 — Core (state, Monte Carlo, Bayes, DAG, Markov; 3 weeks).**

**Phase 6 — Validation suite (2 weeks).** Backtests on critical junctures, calibration plots, sensitivity analyses.

**Phase 7 — Editorial integration (1 week).** Hook into Phase 1 brief generation and Phase 5 synthesis check.

**Phase 8 — Extend backward (open-ended).** P3-P5 (1957–2008), P2 (colonial, where data permits), P1 (sultanate, narrative-only for context).

Total realistic timeline: 4-6 months for Phases 1–7. Each phase produces a deliverable that is usable on its own — the engine is useful even before all mechanisms are implemented (a coalition-formation-only engine is already informative).

---

## 11. Open Theoretical Questions

These are problems the engine *will* hit and *does not yet* have a fully-justified answer to. Marking them here so they aren't quietly papered over.

1. **How to encode the YDPA's "personal discretion" without modelling personality.** Current plan: model as institution-level response variable, calibrate frequency to historical record, but accept the engine cannot predict individual interventions.

2. **How to model Sabah-Sarawak as a single actor vs separate.** Plan: separate actors, allow strategic coordination as an emergent property (issue 1705 documents 49-MP coordination).

3. **How to handle pre-2008 patronage data, where primary sources are thin.** Plan: encode what exists, mark Confidence = LOW on the rest, refuse to use LOW-confidence data in calibration.

4. **How to incorporate foreign interference (China, US, Singapore) without overfitting to a small number of events.** Plan: keep as exogenous shock variable with broad prior, do not attempt point predictions.

5. **How to update the engine when the Constitution itself changes** (constitutional drift mechanism §5.5 is itself part of the engine; changes to it require re-validation). Plan: every drift-mechanism output is logged; major-amendment events trigger a re-calibration cycle.

6. **The unit-of-analysis question for ethnic blocs:** when the model says "the Malay vote", does it mean the aggregate, or the Peninsular-urban-Malay, or the rural-east-coast-Malay? Plan: always disaggregate to at least the four-way split (Peninsular-urban-Malay, Peninsular-rural-Malay, East-Malaysian-Bumiputera, non-Malay-Bumiputera) and never let a single "Malay vote" variable into a published output without disaggregation.

7. **The non-stationarity problem.** Mechanism parameters calibrated on 2008–2020 data may not apply to 2026+ if the regime is itself drifting. Plan: report parameter time-varying estimates; flag when current state is outside training-data convex hull.

---

## 12. References (selected)

The engine draws on the following:

- Bueno de Mesquita, Smith, Siverson, Morrow. *The Logic of Political Survival.* MIT Press, 2003.
- Coakley, J. "Ethnic Conflict and the Two-State Solution." *Ethnopolitics* 7(1), 2008.
- Cox, G. *Making Votes Count.* Cambridge, 1997.
- Hicken, A. "Clientelism." *Annual Review of Political Science* 14, 2011.
- Horowitz, D. *Ethnic Groups in Conflict.* Univ. California, 1985.
- Laver, M., Shepsle, K. *Making and Breaking Governments.* Cambridge, 1996.
- Levitsky, S., Way, L. *Competitive Authoritarianism.* Cambridge, 2010.
- Lijphart, A. *Patterns of Democracy.* Yale, 1999.
- Magaloni, B. *Voting for Autocracy.* Cambridge, 2006.
- Mahoney, J. "Path Dependence in Historical Sociology." *Theory and Society* 29(4), 2000.
- Pearl, J. *Causality.* Cambridge, 2009.
- Pierson, P. *Politics in Time.* Princeton, 2004.
- Tainter, J. *The Collapse of Complex Societies.* Cambridge, 1988.
- Tsebelis, G. *Veto Players.* Princeton, 2002.

Malaysia-specific:

- Crouch, H. *Government and Society in Malaysia.* Cornell, 1996.
- Faruqi, Shad Saleem. *Document of Destiny.* Star Publications, 2008.
- Funston, J. *Malay Politics in Malaysia.* Heinemann, 1980.
- Khoo, B.T. *Paradoxes of Mahathirism.* Oxford, 1995.
- Milne, R.S., Mauzy, D. *Politics and Government in Malaysia.* UBC Press, 1980.
- Slater, D. *Ordering Power.* Cambridge, 2010 (Malaysia is a major case).
- Weiss, M. *The Roots of Resilience.* Cornell, 2020.

T4A internal:

- `malaysia-political-intelligence.md` — the empirical foundation (malapportionment, party-registration mechanics, GLC interlock).
- `malaysia-new-party-strategy.md` — the strategic-actor model the engine instantiates.
- `t4a-dossier-design.md` — the entity-resolution scaffolding.
- All issues in `src/data/issues/` — the event-encoding source corpus.
