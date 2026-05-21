/**
 * Electoral-cycle mechanism module (design doc §5.6).
 *
 * Tractable v0: vote-shares → seat distribution via a rural-bias index.
 *
 * Malaysia's malapportionment (9:1 voter-weight ratio between largest and
 * smallest seats) creates systematic over-representation of rural seats
 * and under-representation of urban seats. Each party has a documented
 * geographic-base profile (e.g., PAS = heavily rural, DAP = heavily urban)
 * captured in a rural_index ∈ [-1, 1] (-1 fully urban, +1 fully rural).
 *
 * The model:
 *   biased_share[p] = vote_share[p] × (1 + rural_bias × rural_index[p])
 *   normalize so Σ biased_share = 1
 *   seats[p] = round(biased_share[p] × total_seats)
 *
 * Calibration parameters (rural_bias=0.30, rural_index per party) were
 * hand-tuned to reproduce GE12-15 seat distributions within ±10% per party.
 * Calibration script: scripts/sim-test-electoral.mjs.
 *
 * Limitations v0:
 *   - Aggregate national-level model; does not allocate per-constituency.
 *   - Strategic-coordination effects (Duverger, vote-splitting) not modelled.
 *   - Sabah/Sarawak vs Peninsular asymmetry approximated through rural_index.
 *   - No incumbency advantage, candidate-quality effect, or campaign-finance
 *     effect.
 * v1 (Phase 6) will validate against GE12/13/14/15 and refine.
 *
 * Input shape: state with state.voteShares = { partyId: shareIn01 }.
 *              Each state.parties[i] should have a rural_index field;
 *              if absent, treated as 0.
 *
 * Output: state with state.parties[i].seats populated. state.voteShares
 *         is preserved for downstream attribution.
 */

import { updateState } from "../core/state.mjs";

const DEFAULT_RURAL_BIAS = 0.30;

/**
 * Project vote shares to seat shares using the rural-bias model.
 *
 * @param {object} voteShares — { partyId: shareIn01 }, must sum to ~1.
 * @param {Array}  parties — [{id, rural_index?}, ...].
 * @param {number} totalSeats
 * @param {number} ruralBias — global parameter (default 0.30).
 * @returns {{ seats: object, biasedShares: object, normalizationFactor: number }}
 */
export function projectSeats(voteShares, parties, totalSeats, ruralBias = DEFAULT_RURAL_BIAS) {
  const indexById = new Map(parties.map(p => [p.id, p.rural_index ?? 0]));

  const biased = {};
  let sum = 0;
  for (const [pid, share] of Object.entries(voteShares)) {
    const idx = indexById.get(pid) ?? 0;
    const adjusted = share * (1 + ruralBias * idx);
    biased[pid] = Math.max(0, adjusted);
    sum += biased[pid];
  }

  const normalized = {};
  for (const pid of Object.keys(biased)) {
    normalized[pid] = sum > 0 ? biased[pid] / sum : 0;
  }

  // Apportion seats: largest-remainder method to ensure Σ seats = totalSeats.
  const exact = {};
  const floor = {};
  const remainder = {};
  let allocated = 0;
  for (const pid of Object.keys(normalized)) {
    exact[pid] = normalized[pid] * totalSeats;
    floor[pid] = Math.floor(exact[pid]);
    remainder[pid] = exact[pid] - floor[pid];
    allocated += floor[pid];
  }
  const slack = totalSeats - allocated;
  const order = Object.keys(remainder).sort((a, b) => remainder[b] - remainder[a]);
  const seats = { ...floor };
  for (let i = 0; i < slack; i++) seats[order[i]] += 1;

  return {
    seats,
    biasedShares: normalized,
    normalizationFactor: sum,
  };
}

/**
 * Run the electoral mechanism on a state, returning a new state.
 *
 * If state.voteShares is null, this is a pass-through (the state
 * already has seats baked in — e.g., post-electoral starting state).
 */
export function electoralMechanism(state, options = {}) {
  if (!state.voteShares) {
    return updateState(state, "electoral", {}, {
      reason: "voteShares not provided; pass-through. state.parties[].seats unchanged.",
    });
  }

  const ruralBias = options.ruralBias ?? DEFAULT_RURAL_BIAS;
  const totalSeats = state.totalSeats;

  const projection = projectSeats(state.voteShares, state.parties, totalSeats, ruralBias);

  const newParties = state.parties.map(p => ({
    ...p,
    seats: projection.seats[p.id] ?? 0,
  }));

  return updateState(state, "electoral",
    { parties: newParties },
    {
      ruralBias,
      voteShares: state.voteShares,
      biasedShares: projection.biasedShares,
      seatDistribution: projection.seats,
      method: "vote-share × (1 + rural_bias × rural_index), largest-remainder apportionment",
    }
  );
}
