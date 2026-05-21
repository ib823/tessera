/**
 * Ethnic-outbidding mechanism module (design doc §5.2).
 *
 * Models Horowitz (1985) outbidding dynamics: in a divided society
 * with mono-ethnic parties, intra-ethnic competition drives positions
 * toward the ethnic-assertive extreme.
 *
 * Tractable v0:
 *
 *   For each pair of competing parties (parties identified as sharing
 *   the same ethnic-mobilisation primary axis and not in the same
 *   coalition):
 *
 *     gap = position[i, axis] - position[j, axis]
 *     position[i, axis] += sign(gap) × outbidding_rate × |gap|
 *       (clamped to [-1, 1])
 *
 *   Damper: if party i is in a multi-ethnic coalition, outbidding
 *   rate is reduced by `coalition_damper` (default 0.5).
 *
 * The canonical Malaysian case is UMNO vs PAS competing on the
 * "islamic-emphasis" + "ethnic-mobilisation" axes for the Malay-Muslim
 * vote. Over GE10-15, PAS pulled UMNO toward greater ethnic-religious
 * assertion. The 2018 PH-BN coalition broke UMNO's outbidding lock by
 * placing it in a multi-ethnic government (damper activated). 2020
 * Sheraton broke that damper.
 *
 * Operates BEFORE electoral mechanism in a forward simulation — party
 * positions feed back into coalition compatibility. For backtesting,
 * outbidding has typically already happened by the time vote shares
 * are observed; the mechanism is a forward-projection tool.
 *
 * Limitations v0:
 *   - Single-axis outbidding (could be multi-axis with weights)
 *   - Competitive pairs hand-identified rather than auto-detected
 *     from cleavage salience
 *   - No issue-attention dynamic (Berger-Milkman arousal not modelled)
 */

import { updateState } from "../core/state.mjs";

const DEFAULT_OUTBIDDING_RATE = 0.15;
const DEFAULT_COALITION_DAMPER = 0.5;
const POSITION_CLAMP = 1.0;

/**
 * Default competitive pairs for Malaysian federal politics.
 * Each entry: [partyA, partyB, primaryAxis].
 */
const DEFAULT_COMPETITIVE_PAIRS = [
  ["UMNO", "PAS", "islamic-emphasis"],
  ["UMNO", "PAS", "ethnic-mobilisation"],
  ["BN", "PN", "ethnic-mobilisation"],
  ["BN", "PN", "islamic-emphasis"],
  ["PH", "MUDA", "reform-status-quo"],
  ["DAP", "PKR", "ethnic-mobilisation"],
];

function clamp(v) {
  return Math.max(-POSITION_CLAMP, Math.min(POSITION_CLAMP, v));
}

function inSameCoalition(state, idA, idB) {
  const candidates = state.coalition?.candidates ?? [];
  for (const c of candidates) {
    const ids = new Set(c.members.map(m => m.id));
    if (ids.has(idA) && ids.has(idB)) return true;
  }
  // Also check blockedPairs — if blocked, definitionally not in same coalition
  const blockedPairs = state.blockedPairs ?? [];
  for (const [a, b] of blockedPairs) {
    if ((a === idA && b === idB) || (b === idA && a === idB)) return false;
  }
  return false;
}

function inMultiEthnicCoalition(state, partyId) {
  const candidates = state.coalition?.candidates ?? [];
  for (const c of candidates) {
    const ids = c.members.map(m => m.id);
    if (!ids.includes(partyId)) continue;
    // Heuristic: a coalition is "multi-ethnic" if it spans at least one
    // pair of parties with opposite-sign ethnic-mobilisation positions.
    const positions = ids.map(id => {
      const p = state.parties.find(p => p.id === id);
      return p?.ideology?.["ethnic-mobilisation"] ?? 0;
    });
    const hasPositive = positions.some(v => v > 0.1);
    const hasNegative = positions.some(v => v < -0.1);
    if (hasPositive && hasNegative) return true;
  }
  return false;
}

/**
 * Apply outbidding update to a single party pair on one axis.
 * Returns { delta_a, delta_b } — the position changes to apply.
 */
function pairUpdate(state, partyA, partyB, axis, rate, damper) {
  const posA = partyA.ideology?.[axis] ?? 0;
  const posB = partyB.ideology?.[axis] ?? 0;
  const gap = posA - posB;
  const absGap = Math.abs(gap);

  // Each party shifts toward its own extreme by rate × absGap.
  // sign indicates direction of self-shift (the party with higher
  // position moves higher; lower moves lower).
  const signA = gap > 0 ? 1 : -1;
  const signB = -signA;

  let dA = signA * rate * absGap;
  let dB = signB * rate * absGap;

  // Apply damper if either party is in a multi-ethnic coalition.
  if (inMultiEthnicCoalition(state, partyA.id)) dA *= damper;
  if (inMultiEthnicCoalition(state, partyB.id)) dB *= damper;

  return { dA, dB };
}

/**
 * Run the outbidding mechanism.
 */
export function outbiddingMechanism(state, options = {}) {
  const rate = options.outbiddingRate ?? DEFAULT_OUTBIDDING_RATE;
  const damper = options.coalitionDamper ?? DEFAULT_COALITION_DAMPER;
  const pairs = options.competitivePairs ?? DEFAULT_COMPETITIVE_PAIRS;

  const partyIndex = new Map(state.parties.map(p => [p.id, p]));
  const updates = new Map(state.parties.map(p => [p.id, { ...p.ideology }]));
  const shifts = [];

  for (const [aId, bId, axis] of pairs) {
    const a = partyIndex.get(aId);
    const b = partyIndex.get(bId);
    if (!a || !b) continue;
    if (inSameCoalition(state, aId, bId)) continue; // no outbidding within a coalition

    const { dA, dB } = pairUpdate(state, a, b, axis, rate, damper);

    const newA = clamp((updates.get(aId)[axis] ?? 0) + dA);
    const newB = clamp((updates.get(bId)[axis] ?? 0) + dB);

    updates.get(aId)[axis] = newA;
    updates.get(bId)[axis] = newB;

    shifts.push({
      pair: [aId, bId],
      axis,
      gap: a.ideology[axis] - b.ideology[axis],
      delta: { [aId]: dA, [bId]: dB },
    });
  }

  const newParties = state.parties.map(p => ({
    ...p,
    ideology: updates.get(p.id),
  }));

  return updateState(state, "outbidding",
    { parties: newParties },
    {
      pairsActivated: shifts.length,
      shifts,
      outbiddingRate: rate,
      coalitionDamper: damper,
    }
  );
}
