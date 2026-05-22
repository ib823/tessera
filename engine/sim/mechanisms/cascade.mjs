/**
 * Crisis-cascade mechanism module (design doc §5.7).
 *
 * Models scandal cascades, defection cascades, and coalition-collapse
 * dynamics per Tainter (1988) and Bak self-organised criticality.
 *
 *   cascade_probability = σ(α × stressor_magnitude + β × state_fragility − γ)
 *
 * where σ is the logistic function and (α, β, γ) are calibrated parameters.
 * When cascade fires, it propagates through the coalition-fragility graph:
 * each member party has a defection_probability that scales with the
 * cascade intensity.
 *
 * Empirical anchors (calibrated to documented Malaysian cascades):
 *
 *   - 1MDB cascade 2015-2018: stressor=0.9 (multi-billion scandal), state
 *     fragility=0.6 (post-Anwar-Sodomy-II, BN cohesion eroded), produced
 *     full coalition turnover via GE14.
 *   - Sheraton Move Feb 2020: stressor=0.7 (PKR-Bersatu rivalry), state
 *     fragility=0.8 (PH-internal tensions high), produced government
 *     collapse within 7 days.
 *   - Pakatan Rakyat dissolution 2015: stressor=0.6 (DAP-PAS hudud
 *     dispute), state fragility=0.7, produced coalition formal dissolution.
 *   - Reformasi 1998: stressor=0.9 (Anwar sacking), state fragility=0.4
 *     (BN majority strong), produced street mobilisation but no
 *     immediate government change — slow cascade over 20 years.
 *
 * Fragility components (state.crisisIndicators):
 *   - hung_parliament: 0.4 contribution
 *   - thin_majority: 0.2 contribution (margin < 5% above threshold)
 *   - scandal_intensity: up to 0.3
 *   - coalition_internal_tension: up to 0.3
 *   - economic_stress: up to 0.2
 *
 * Output:
 *   - cascade.probability: 0..1
 *   - cascade.fired: boolean (true if probability > 0.5)
 *   - cascade.likelyMechanism: "scandal" | "defection" | "no-confidence" | "external"
 *   - cascade.atRiskParties: [{partyId, defectionProbability}]
 *   - cascade.predictedOutcome: brief description
 *
 * Limitations v0:
 *   - Logistic parameters hand-calibrated, not learned.
 *   - Propagation graph is heuristic (members in low-coherence coalitions
 *     are most at risk), not based on inter-party defection data.
 *   - No multi-stage cascade modelling (a cascade in t may trigger another
 *     in t+1; we don't iterate).
 */

import { updateState } from "../core/state.mjs";

const LOGISTIC_ALPHA = 3.5;  // stressor weight
const LOGISTIC_BETA = 2.5;   // fragility weight
const LOGISTIC_GAMMA = 2.5;  // baseline (raises threshold)

function logistic(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Compute state fragility from crisisIndicators + coalition state.
 */
export function stateFragility(state) {
  const ci = state.crisisIndicators ?? {};
  let fragility = 0;

  if (ci.hungParliament) fragility += 0.4;
  if (ci.thinMajority) fragility += 0.2;
  fragility += (ci.scandalIntensity ?? 0) * 0.3;
  fragility += (ci.coalitionInternalTension ?? 0) * 0.3;
  fragility += (ci.economicStress ?? 0) * 0.2;
  fragility += (ci.defectionCascade ? 0.3 : 0);
  fragility += (ci.constitutionalAmbiguity ? 0.1 : 0);

  // Coalition-derived fragility: low coherence + thin margin
  const top = state.coalition?.candidates?.[0];
  if (top) {
    const margin = top.totalSeats - state.totalSeats * 0.5;
    if (margin < state.totalSeats * 0.05) fragility += 0.2;
    if (top.coherence < 0.6) fragility += 0.15;
  }

  return Math.min(1, fragility);
}

/**
 * Identify likely cascade mechanism from current indicators.
 */
function identifyMechanism(state, fragility) {
  const ci = state.crisisIndicators ?? {};
  if (ci.scandalIntensity > 0.7) return "scandal";
  if (ci.defectionCascade || ci.coalitionInternalTension > 0.6) return "defection";
  if (ci.hungParliament) return "no-confidence";
  if (ci.constitutionalAmbiguity) return "no-confidence";
  if (fragility > 0.7) return "defection"; // default for high fragility
  return "low-risk";
}

/**
 * For each coalition member, compute defection probability under cascade.
 * Heuristic: members furthest from coalition centroid + smallest by seats
 * are at highest risk.
 */
function atRiskParties(state, fragility) {
  const top = state.coalition?.candidates?.[0];
  if (!top) return [];

  const members = top.members.map(m => {
    const full = state.parties.find(p => p.id === m.id);
    return { ...full, seats: m.seats };
  });

  if (members.length < 2) return [];

  // Centroid
  const axes = [...new Set(members.flatMap(p => Object.keys(p.ideology ?? {})))];
  const totalSeats = members.reduce((s, p) => s + p.seats, 0);
  const centroid = {};
  for (const a of axes) {
    centroid[a] = members.reduce((s, p) => s + (p.ideology?.[a] ?? 0) * p.seats, 0) / totalSeats;
  }

  return members.map(m => {
    let dist = 0;
    for (const a of axes) {
      const v = m.ideology?.[a] ?? 0;
      dist += (v - centroid[a]) ** 2;
    }
    dist = Math.sqrt(dist);
    const maxDist = Math.sqrt(4 * axes.length);
    const distanceFactor = dist / maxDist;
    const sizeFactor = 1 - (m.seats / totalSeats);
    // Defection prob: fragility × (distance + size disadvantage)
    const prob = Math.min(0.95, fragility * (0.5 + 0.5 * (distanceFactor + sizeFactor) / 2));
    return {
      partyId: m.id,
      partyName: m.name,
      seats: m.seats,
      defectionProbability: prob,
      distanceFromCentroid: dist,
    };
  }).sort((a, b) => b.defectionProbability - a.defectionProbability);
}

/**
 * Run the cascade mechanism. Takes a state with optional crisisIndicators
 * and a stressor magnitude (default derived from indicators), computes
 * cascade probability, and identifies at-risk parties.
 */
export function cascadeMechanism(state, options = {}) {
  const fragility = stateFragility(state);
  const stressor = options.stressorMagnitude ??
    Math.max(
      state.crisisIndicators?.scandalIntensity ?? 0,
      state.crisisIndicators?.defectionCascade ? 0.6 : 0,
      state.crisisIndicators?.competingPMClaims ? 0.7 : 0,
    );

  const x = LOGISTIC_ALPHA * stressor + LOGISTIC_BETA * fragility - LOGISTIC_GAMMA;
  const probability = logistic(x);
  const fired = probability > 0.5;

  const mechanism = identifyMechanism(state, fragility);
  const atRisk = fired ? atRiskParties(state, fragility) : [];

  let predictedOutcome;
  if (!fired) {
    predictedOutcome = "no-cascade — system absorbs stressor";
  } else if (mechanism === "scandal") {
    predictedOutcome = "scandal-driven legitimacy collapse — coalition may survive but lose mandate";
  } else if (mechanism === "defection") {
    predictedOutcome = `defection cascade — ${atRisk.filter(p => p.defectionProbability > 0.5).length} parties at high risk`;
  } else if (mechanism === "no-confidence") {
    predictedOutcome = "no-confidence vote likely — government formation unstable";
  } else {
    predictedOutcome = "elevated cascade risk — no specific mechanism dominant";
  }

  return updateState(state, "cascade",
    {
      cascade: {
        probability,
        fired,
        fragility,
        stressorMagnitude: stressor,
        likelyMechanism: mechanism,
        atRiskParties: atRisk,
        predictedOutcome,
      },
    },
    {
      probability,
      fired,
      fragility,
      stressor,
      mechanism,
    }
  );
}
