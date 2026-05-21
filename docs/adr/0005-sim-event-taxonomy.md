# ADR-0005: Simulation-engine event taxonomy — 16 closed types

**Status:** Accepted (2026-05-21)
**Related:** `docs/research/malaysia-political-simulation-engine.md` §3.2; ADR-0006 (pre-2008 encoding deferral); `engine/sim/schema/event.schema.json`.

## Context

The Phase 0 design doc (`malaysia-political-simulation-engine.md`) proposed an 11-type closed event taxonomy. Reviewing it against the actual demands of the seven mechanism modules (§5) and the documented historical record, three structural gaps surfaced:

1. **Constitutional amendments collapsed into ordinary legislative votes.** This loses the distinction between rules-of-the-game change (Article 159, requires 2/3) and play-of-the-game action. The constitutional-drift mechanism (§5.5) requires this distinction to function.
2. **Slow-moving demographic shifts had no encoding slot.** Urban-Malay share growth from 1970 to 2020 is one of the most consequential variables in Malaysian political dynamics, but it is not a discrete event in the same sense as an election. Without an encoding slot it gets dropped or fudged into PolicyAnnouncement.
3. **Elite personnel changes (cabinet reshuffles, GLC chief swaps, judicial appointments, party defections) collapsed into PolicyAnnouncement.** The patronage-allocation mechanism (§5.3) needs these as first-class events; collapsing them loses the network-rewiring signal.
4. **Institutional creation/dissolution and coalition formation/dissolution** had no slot. MACC's creation in 2009, the founding of Bersatu in 2016, the dissolution of Pakatan Rakyat in 2015, the formation of PH and PN as parliamentary blocs — these are structural and high-leverage.

A second concern: should ResourceTransfer be split into legal vs illicit? Decision: **no.** Legality is a property of the transfer, not a type distinction. Splitting would create encoding ambiguity for contested cases (e.g., political donations under the absent disclosure regime — issue 1944). Better to keep one type and carry a `legality` field with the values `legal`, `illicit`, `contested`.

## Decision

**The simulation engine encodes events under a closed taxonomy of 16 types.** Any historical event must fit exactly one type. If it does not, the taxonomy is wrong and gets updated via a new ADR.

The 16 types:

| # | Type | Description |
|---|---|---|
| 1 | `Election` | Federal, state, or by-election. Includes nomination, polling, declaration. |
| 2 | `LegislativeVote` | Vote on ordinary legislation or motion in any legislature. Includes outcome. |
| 3 | `ConstitutionalAmendment` | Article 159 amendment to Federal or State Constitution. Separate because rules-of-the-game change. |
| 4 | `RoyalIntervention` | YDPA, Conference of Rulers, or state Sultan acting under Article 32, 40, 42, 150, 181, or state-constitution equivalents. |
| 5 | `CoupOrAttempt` | Extra-constitutional or contested transfer of power. Sheraton 2020 belongs here; ordinary defections do not. |
| 6 | `Protest` | Mass demonstration, riot, organised civil-society mobilisation. |
| 7 | `TrialVerdict` | Judicial decision in a case of political consequence (corruption, sedition, defamation, constitutional reference). |
| 8 | `PolicyAnnouncement` | Stated intent to enact or alter policy, separate from the vote that enacts it. |
| 9 | `ScandalRevelation` | Public surfacing of allegation, leaked document, audit finding, or investigative report. Information shock, not adjudication. |
| 10 | `ResourceTransfer` | Money, contract, concession, or asset flow between actors. Carries `legality: legal | illicit | contested`. |
| 11 | `DiscursiveEvent` | Speech, statement, or framing act of public consequence. Reach-estimate required. |
| 12 | `DemographicShift` | Slow-moving population change (urbanisation, migration, fertility, generational replacement). Encoded at period-level granularity. |
| 13 | `ElitePersonnelChange` | Appointment, dismissal, resignation, party defection, expulsion. Subtype field distinguishes cases. |
| 14 | `InstitutionalCreation` | Formation or dissolution of an agency, party, GLC, or formal institution. |
| 15 | `CoalitionFormation` | Formation or dissolution of a multi-party coalition. Structurally distinct from a single party event. |
| 16 | `ExogenousShock` | Foreign-policy, economic, climate, pandemic, or other event with origin outside the political system. Broad-tailed prior; engine does not predict timing. |

### Encoding rules

- Every event carries a `type` field set to exactly one of the 16 strings above.
- Common fields (id, date, period, sources, confidence, actors_involved, cleavages_activated, legitimacy_delta) apply to every type. Type-specific fields apply only where listed in the JSON schema.
- An event that plausibly fits two types is encoded under the **structurally dominant** type and cross-referenced via `related_events[]`. Example: a cabinet reshuffle (ElitePersonnelChange) that *also* announces a new policy (PolicyAnnouncement) is encoded as ElitePersonnelChange with a related PolicyAnnouncement, not split or duplicated.
- Sources must satisfy the §3.6 tier requirement: ≥1 Tier 1, OR ≥2 Tier 2, OR ≥1 Tier 2 + ≥2 Tier 3. Tier 4 alone is insufficient.

### What this taxonomy does *not* encode

- **Sentiment, vibe, mood.** These are derived measures computed from DiscursiveEvent aggregations, not first-class events.
- **Counterfactuals.** A "what if" is a query against the engine, not an event in the data.
- **Predictions or forecasts.** Forecasts live in `engine/sim/forecasts/`, separate from `engine/sim/data/events/`.
- **Editorial interpretations.** T4A issue cards are not events. They are *reporting on* events.

## Consequences

- Phase 1 JSON schemas reflect 16 types, not 11.
- Encoding workload increases marginally (mostly ElitePersonnelChange events that previously would have been omitted entirely).
- The drift mechanism (§5.5) and patronage mechanism (§5.3) become implementable; under the 11-type taxonomy they were under-specified.
- Future additions require a new ADR. Adding a 17th type is allowed but not free.

## Rejected alternatives

- **Open taxonomy.** Considered and rejected. Open taxonomies in event-data projects (ICEWS, GDELT) suffer from inter-coder disagreement that destroys downstream mechanism calibration. Closed taxonomy with periodic ADR revision is the proven approach (CAMEO, PHOEMENT, ACLED).
- **Split ResourceTransfer into legal/illicit types.** Rejected because legality is a contested property, not a structural distinction. Carrying it as a field preserves encoding for ambiguous cases.
- **Subsume CoalitionFormation under ElitePersonnelChange.** Rejected because coalitions and individuals are different aggregation levels; mechanism modules need them separable.
- **Add a "Crisis" top-level type.** Rejected because crisis is an emergent property (Mechanism §5.7), not a primitive event. A crisis is a *cascade through* primitive events, not itself one.
