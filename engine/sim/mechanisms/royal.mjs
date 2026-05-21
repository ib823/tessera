/**
 * Royal-intervention mechanism module (design doc §5.4).
 *
 * Models the STRUCTURAL behavior of royal arbitration in coalition-
 * formation contexts. Per §5.4 discipline: this mechanism encodes
 * institutional response patterns, NOT royal personal preference or
 * theological reasoning (the 3R discipline of §9.3).
 *
 * Trigger condition (calibrated from documented interventions —
 * 2009 Perak, 2020 Sheraton, 2022 PM selection, 2024 Najib home
 * detention):
 *
 *   crisisLevel(state) = max over indicators:
 *     hungParliament:    1.0 if no coalition > 50%, else linear by margin
 *     defectionCascade:  0.7 if crisisIndicators.defectionCascade
 *     scandalCascade:    0.5 if crisisIndicators.scandalCascade
 *     constitutionalAmb: 0.6 if crisisIndicators.constitutionalAmbiguity
 *
 *   intervention fires when crisisLevel > 0.5
 *
 * Action in coalition contexts: broaden the natural top-1 coalition by
 * adding the next-most-compatible non-blocked party, iteratively, until
 * the seat margin exceeds a STABILITY_BUFFER above the formation
 * threshold. Compatibility = inverse of ideology distance from current
 * coalition centroid.
 *
 * This reproduces the empirical pattern: 2022 GE15 Anwar's natural
 * coalition was PH+GPS+GRS+Warisan (~114 seats, 51.4% — thin); royal
 * arbitration favored broader stability, leading to BN's inclusion
 * (148 seats, 66.7% — much safer).
 *
 * Input: state with state.coalition.candidates (output of §5.1).
 * Output: state with state.coalition.broadenedCoalition set, plus
 *         state.royalIntervention recording the trigger details.
 */

import { updateState } from "../core/state.mjs";

const STABILITY_BUFFER_FRACTION = 0.07;  // target margin = threshold + 7%
const CRISIS_THRESHOLD = 0.5;

function ideologyDistance(p1, p2, axes) {
  let sum = 0;
  for (const a of axes) {
    const v1 = p1.ideology?.[a] ?? 0;
    const v2 = p2.ideology?.[a] ?? 0;
    sum += (v1 - v2) ** 2;
  }
  return Math.sqrt(sum);
}

function coalitionCentroid(parties, axes) {
  const c = {};
  const total = parties.reduce((s, p) => s + p.seats, 0);
  for (const a of axes) {
    if (total === 0) { c[a] = 0; continue; }
    c[a] = parties.reduce((s, p) => s + (p.ideology?.[a] ?? 0) * p.seats, 0) / total;
  }
  return c;
}

function isBlockedPair(a, b, blockedPairs) {
  for (const [x, y] of blockedPairs) {
    if ((x === a && y === b) || (x === b && y === a)) return true;
  }
  return false;
}

function isBlockedWithCoalition(candidate, members, blockedPairs) {
  for (const m of members) {
    if (isBlockedPair(candidate.id, m.id, blockedPairs)) return true;
  }
  return false;
}

/**
 * Compute the crisis level of a state. Range [0, 1].
 */
export function crisisLevel(state) {
  const indicators = state.crisisIndicators ?? {};
  let max = 0;

  // Hung parliament: scale by how-far-from-majority the top coalition is.
  if (state.coalition?.candidates?.length) {
    const top = state.coalition.candidates[0];
    const threshold = state.totalSeats * 0.5;
    const margin = top.totalSeats - threshold;
    if (margin <= 0) {
      max = Math.max(max, 1.0);
    } else if (margin < state.totalSeats * 0.05) {
      max = Math.max(max, 1.0 - margin / (state.totalSeats * 0.05));
    }
  }

  if (indicators.defectionCascade) max = Math.max(max, 0.7);
  if (indicators.scandalCascade) max = Math.max(max, 0.5);
  if (indicators.constitutionalAmbiguity) max = Math.max(max, 0.6);
  if (indicators.competingPMClaims) max = Math.max(max, 0.9);

  return max;
}

/**
 * Broaden a coalition by adding parties until seat margin > target buffer.
 * Each addition picks the most-compatible non-blocked party available.
 */
function broadenCoalition(natural, state, axes) {
  const allParties = state.parties;
  const blockedPairs = state.blockedPairs ?? [];
  const targetMargin = state.totalSeats * (0.5 + STABILITY_BUFFER_FRACTION);

  let members = natural.members.map(m => {
    const full = allParties.find(p => p.id === m.id);
    return { ...full, seats: m.seats };
  });

  const additions = [];
  let totalSeats = members.reduce((s, p) => s + p.seats, 0);

  while (totalSeats < targetMargin) {
    const centroid = coalitionCentroid(members, axes);
    const candidates = allParties
      .filter(p => !members.find(m => m.id === p.id))
      .filter(p => !isBlockedWithCoalition(p, members, blockedPairs))
      .filter(p => p.seats > 0)
      .map(p => ({
        party: p,
        distance: ideologyDistance({ ideology: centroid }, p, axes),
      }))
      .sort((a, b) => a.distance - b.distance);

    if (candidates.length === 0) break;

    const chosen = candidates[0].party;
    members.push(chosen);
    additions.push({
      partyId: chosen.id,
      partyName: chosen.name,
      seatsAdded: chosen.seats,
      ideologyDistanceFromCentroid: candidates[0].distance,
    });
    totalSeats += chosen.seats;
  }

  return {
    members: members.map(p => ({ id: p.id, name: p.name, seats: p.seats })),
    totalSeats,
    additions,
    margin: totalSeats - state.totalSeats * 0.5,
  };
}

/**
 * Run the royal-intervention mechanism on a state.
 *
 * Returns a new state with `royalIntervention` field populated. If no
 * intervention fires, the field carries { fired: false, ... }.
 */
export function royalMechanism(state, options = {}) {
  const threshold = options.crisisThreshold ?? CRISIS_THRESHOLD;
  const crisis = crisisLevel(state);

  if (crisis < threshold) {
    return updateState(state, "royal",
      { royalIntervention: { fired: false, crisisLevel: crisis, reason: "below threshold" } },
      { crisisLevel: crisis, threshold }
    );
  }

  if (!state.coalition?.candidates?.length) {
    return updateState(state, "royal",
      { royalIntervention: { fired: false, crisisLevel: crisis, reason: "no natural coalition to modify" } },
      { crisisLevel: crisis }
    );
  }

  const axes = [...new Set(state.parties.flatMap(p => Object.keys(p.ideology ?? {})))];
  const natural = state.coalition.candidates[0];
  const broadened = broadenCoalition(natural, state, axes);

  return updateState(state, "royal",
    {
      coalition: {
        ...state.coalition,
        broadenedCoalition: broadened,
      },
      royalIntervention: {
        fired: true,
        crisisLevel: crisis,
        threshold,
        mechanism: "broaden-to-stability-buffer",
        naturalCoalition: {
          members: natural.members.map(m => m.id),
          totalSeats: natural.totalSeats,
        },
        broadenedCoalition: {
          members: broadened.members.map(m => m.id),
          totalSeats: broadened.totalSeats,
        },
        additions: broadened.additions,
      },
    },
    {
      crisisLevel: crisis,
      threshold,
      partiesAdded: broadened.additions.length,
      seatsAdded: broadened.totalSeats - natural.totalSeats,
    }
  );
}
