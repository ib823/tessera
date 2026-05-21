/**
 * Patronage-allocation mechanism module (design doc §5.3).
 *
 * Models clientelistic resource flow and the LEGAL-EXPOSURE-driven
 * coalition-entry incentive (Hicken 2011; Magaloni 2006).
 *
 * Two effects on a coalition state:
 *
 *   1. PATRONAGE LEDGER — for the current coalition, allocate non-
 *      portfolio resources (federal contracts, GLC board seats,
 *      regulatory-discretion access) by party. Default rule: Gamson's
 *      law (seat-share basis) plus a `cabinet_premium` for the
 *      formateur (canonical 1.3x) per Warwick-Druckman (2001).
 *
 *   2. LEGAL-EXPOSURE ENTRY — for each non-member party with high
 *      `legal_exposure` (Court Cluster, ongoing prosecutions, pending
 *      DNAA decisions), compute the value of being inside vs outside
 *      government. If the inside value exceeds outside, mark the party
 *      as wanting-in and (if formateur consents and no block fires)
 *      add to coalition.
 *
 * The Court Cluster effect on GE15 Unity Government is the canonical
 * Malaysian case: UMNO's senior leadership had high legal exposure
 * (Zahid 47 charges, Najib appeals pending, Tengku Adnan etc.). Inside
 * government, AGC/MACC referrals run through cabinet-aligned channels;
 * outside, they don't. This raised UMNO's effective coalition-entry
 * value above its ideological distance from PH.
 *
 * v0 limitations:
 *   - cabinet_premium hand-set, not calibrated from portfolio-share data
 *   - legal_exposure is a single scalar; real exposure is per-leader
 *   - no GLC patronage dynamics (those need event encoding of board
 *     appointments — see Phase 2b backlog)
 *
 * Input: state with state.coalition.candidates (from §5.1).
 *        Each party may have a `legal_exposure` field ∈ [0, 1].
 * Output: state with state.patronage = { ledger, entrants, departures }
 *         and (if entrants exist) modified coalition.
 */

import { updateState } from "../core/state.mjs";

const CABINET_PREMIUM = 1.3;
const LEGAL_EXPOSURE_ENTRY_THRESHOLD = 0.5;

function gamsonAllocation(coalitionMembers, formateurId) {
  const total = coalitionMembers.reduce((s, m) => s + m.seats, 0);
  const out = {};
  for (const m of coalitionMembers) {
    let share = total > 0 ? m.seats / total : 0;
    if (m.id === formateurId) share *= CABINET_PREMIUM;
    out[m.id] = share;
  }
  // Renormalise so allocation still sums to 1.
  const sum = Object.values(out).reduce((s, v) => s + v, 0);
  for (const k of Object.keys(out)) out[k] = sum > 0 ? out[k] / sum : 0;
  return out;
}

/**
 * Estimate the value to a party of being inside the coalition.
 *
 *   inside_value = patronage_share + legal_protection_bonus
 *
 * where legal_protection_bonus = legal_exposure × 0.6 (calibrated
 * to make a heavily-exposed party prefer inside even at low share).
 */
function insideValue(party, allocationShare) {
  const baseline = allocationShare;
  const legalBonus = (party.legal_exposure ?? 0) * 0.6;
  return baseline + legalBonus;
}

/**
 * Estimate the value to a party of staying outside.
 *
 *   outside_value = opposition_premium - legal_exposure × 0.3
 *
 * opposition_premium is small (0.1 baseline) reflecting Malaysia's
 * weak formal opposition recognition (T4A issue 1059).
 */
function outsideValue(party) {
  return 0.10 - (party.legal_exposure ?? 0) * 0.30;
}

/**
 * Score legal-exposure ENTRY candidates: non-members with high exposure
 * who would rather be inside than outside.
 */
function findLegalExposureEntrants(state, currentMembers, formateurId) {
  const memberIds = new Set(currentMembers.map(m => m.id));
  const blockedPairs = state.blockedPairs ?? [];
  const candidates = [];

  for (const party of state.parties) {
    if (memberIds.has(party.id)) continue;
    const exposure = party.legal_exposure ?? 0;
    if (exposure < LEGAL_EXPOSURE_ENTRY_THRESHOLD) continue;

    // Check block compatibility
    let blocked = false;
    for (const [a, b] of blockedPairs) {
      if ((a === party.id && memberIds.has(b)) || (b === party.id && memberIds.has(a))) {
        blocked = true; break;
      }
    }
    if (blocked) continue;

    // Estimate inside vs outside value.
    // Assume entrant would get a share proportional to their seats.
    const provisionalTotal = currentMembers.reduce((s, m) => s + m.seats, 0) + party.seats;
    const provisionalShare = provisionalTotal > 0 ? party.seats / provisionalTotal : 0;
    const inV = insideValue(party, provisionalShare);
    const outV = outsideValue(party);

    if (inV > outV) {
      candidates.push({
        partyId: party.id,
        partyName: party.name,
        seats: party.seats,
        legalExposure: exposure,
        insideValue: inV,
        outsideValue: outV,
        entryMargin: inV - outV,
      });
    }
  }

  return candidates.sort((a, b) => b.entryMargin - a.entryMargin);
}

/**
 * Run the patronage mechanism.
 *
 * Operates on whichever coalition is current: broadenedCoalition if
 * royal mechanism already fired, else natural top-1.
 */
export function patronageMechanism(state, options = {}) {
  const coalition = state.coalition?.broadenedCoalition ?? state.coalition?.candidates?.[0];
  if (!coalition) {
    return updateState(state, "patronage",
      { patronage: { reason: "no coalition to operate on", ledger: {}, entrants: [] } },
      {}
    );
  }

  const formateurId = state.coalition?.formateur?.id ?? state.coalition?.candidates?.[0]?.members?.[0]?.id;
  const currentMembers = coalition.members.map(m => {
    const full = state.parties.find(p => p.id === m.id);
    return { ...full, seats: m.seats };
  });

  const ledger = gamsonAllocation(currentMembers, formateurId);
  const entrants = findLegalExposureEntrants(state, currentMembers, formateurId);

  let modifiedCoalition = null;
  if (entrants.length > 0) {
    const newMembers = [
      ...coalition.members,
      ...entrants.map(e => ({
        id: e.partyId,
        name: e.partyName,
        seats: e.seats,
      })),
    ];
    const newTotal = newMembers.reduce((s, m) => s + m.seats, 0);
    modifiedCoalition = {
      members: newMembers,
      totalSeats: newTotal,
      entrySource: "legal-exposure-patronage",
    };
  }

  const newCoalition = modifiedCoalition
    ? { ...state.coalition, patronageAdjustedCoalition: modifiedCoalition }
    : state.coalition;

  return updateState(state, "patronage",
    {
      coalition: newCoalition,
      patronage: {
        ledger,
        entrants,
        formateurId,
        cabinetPremium: CABINET_PREMIUM,
        legalExposureThreshold: LEGAL_EXPOSURE_ENTRY_THRESHOLD,
      },
    },
    {
      ledgerShares: ledger,
      entrantCount: entrants.length,
      entrantIds: entrants.map(e => e.partyId),
    }
  );
}
