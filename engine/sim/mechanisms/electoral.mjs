/**
 * Electoral-cycle mechanism module (design doc §5.6).
 *
 * Tractable v1: vote-shares → seat distribution via two-parameter model:
 *
 *   biased_share[p] = vote_share[p]
 *                     × (1 + rural_bias × rural_index[p])
 *                     × (1 + concentration_bonus × regional_concentration[p])
 *
 *   normalize so Σ biased_share = 1
 *   seats[p] = largest-remainder apportionment to total_seats
 *
 * The rural-bias term captures malapportionment (9:1 voter-weight ratio
 * between largest and smallest seats). The concentration_bonus term
 * captures FPTP's reward for geographically-concentrated vote
 * distributions: a party with 10% national vote concentrated in
 * 20 seats wins those 20 seats; the same 10% spread evenly wins zero.
 *
 * Default parameter values (calibrated against GE12-15 backtest):
 *   rural_bias = 0.30
 *   concentration_bonus = 0.40
 *
 * Per-party concentration_index calibration (range [0, 1]):
 *   PAS:     0.55  (concentrated in northern Peninsular states)
 *   PN:      0.30  (PAS + Bersatu, with Bersatu more dispersed)
 *   BN:      0.05  (broadly spread nationwide)
 *   PH:      0.10  (broad with urban skew)
 *   DAP:     0.30  (concentrated in urban Peninsular Chinese-majority seats)
 *   GPS:     0.95  (nearly all seats in Sarawak)
 *   GRS:     0.85  (nearly all seats in Sabah)
 *   Warisan: 0.40  (Sabah-concentrated)
 *   MUDA:    0.10  (urban scattered)
 *
 * Limitations v1:
 *   - Per-coalition values would be more accurate (PAS-in-PR vs PAS-in-PN
 *     have different effective concentration); v1 uses static per-party.
 *   - No constituency-level modelling; still aggregate national-share.
 *   - No incumbency / candidate-quality / campaign-finance effects.
 */

import { updateState } from "../core/state.mjs";

const DEFAULT_RURAL_BIAS = 0.30;
const DEFAULT_CONCENTRATION_BONUS = 0.40;

/**
 * Project vote shares to seat shares using the two-parameter model.
 */
export function projectSeats(voteShares, parties, totalSeats, options = {}) {
  const ruralBias = options.ruralBias ?? DEFAULT_RURAL_BIAS;
  const concentrationBonus = options.concentrationBonus ?? DEFAULT_CONCENTRATION_BONUS;

  const ruralIdx = new Map(parties.map(p => [p.id, p.rural_index ?? 0]));
  const concIdx = new Map(parties.map(p => [p.id, p.regional_concentration ?? 0]));

  const biased = {};
  let sum = 0;
  for (const [pid, share] of Object.entries(voteShares)) {
    const ri = ruralIdx.get(pid) ?? 0;
    const ci = concIdx.get(pid) ?? 0;
    const adjusted = share * (1 + ruralBias * ri) * (1 + concentrationBonus * ci);
    biased[pid] = Math.max(0, adjusted);
    sum += biased[pid];
  }

  const normalized = {};
  for (const pid of Object.keys(biased)) {
    normalized[pid] = sum > 0 ? biased[pid] / sum : 0;
  }

  // Largest-remainder apportionment.
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

export function electoralMechanism(state, options = {}) {
  if (!state.voteShares) {
    return updateState(state, "electoral", {}, {
      reason: "voteShares not provided; pass-through.",
    });
  }

  const ruralBias = options.ruralBias ?? DEFAULT_RURAL_BIAS;
  const concentrationBonus = options.concentrationBonus ?? DEFAULT_CONCENTRATION_BONUS;
  const projection = projectSeats(state.voteShares, state.parties, state.totalSeats, {
    ruralBias, concentrationBonus,
  });

  const newParties = state.parties.map(p => ({
    ...p,
    seats: projection.seats[p.id] ?? 0,
  }));

  return updateState(state, "electoral",
    { parties: newParties },
    {
      ruralBias,
      concentrationBonus,
      voteShares: state.voteShares,
      biasedShares: projection.biasedShares,
      seatDistribution: projection.seats,
      method: "rural-bias × concentration-bonus × largest-remainder",
    }
  );
}

