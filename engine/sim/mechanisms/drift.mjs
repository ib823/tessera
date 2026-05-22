/**
 * Constitutional-drift mechanism module (design doc §5.5).
 *
 * Models cumulative constitutional change through four channels
 * (Levinson-Sachs 2015; Tushnet on small-c constitutionalism):
 *
 *   1. Amendment           — Article 159, requires 2/3 of both Houses.
 *                            Discrete, formal, well-documented.
 *   2. Court interpretation — Federal Court rulings that re-read
 *                            constitutional text. Discrete, formal,
 *                            cumulative.
 *   3. Informal convention — PM-chooses-CJ, DPM-from-largest-partner,
 *                            etc. Practices that harden into rules
 *                            without textual change.
 *   4. State-level overreach — State assemblies legislating beyond
 *                            their constitutional reserve. Even if
 *                            later struck down, the act of overreach
 *                            shifts the effective Overton window.
 *
 * Output: drift vector D(t) ∈ R^k where each dimension is a named
 * constitutional axis (judicial_power, royal_discretion, federalism,
 * expression_restriction, religious_jurisdiction, electoral_independence,
 * bumiputera_policy). Each event contributes a signed magnitude;
 * accumulation produces the effective constitutional position vs the
 * 1957 baseline (D = 0).
 *
 * Cleavage interaction (§5.5 design doc): drift shifts cleavage salience.
 * For example, expression_restriction drift increases reform-vs-status-quo
 * salience.
 *
 * Calibration anchors:
 *   - 1988 Article 121(1) amendment: -0.5 on judicial_power
 *   - Nik Elin (2024): +0.10 on judicial_power, -0.10 on religious_jurisdiction
 *   - Johor appointed assemblymen 2026: +0.10 on state_level_overreach
 *   - CMA s.233 10x penalty hike Feb 2025: +0.15 on expression_restriction
 *   - Sedition Act doubling cases 2025: +0.10 on expression_restriction
 *
 * Limitations v0:
 *   - Event-to-drift mapping is hand-calibrated, not learned.
 *   - Reversal asymmetry not modelled (ratchets are easier than rollbacks).
 *   - No time decay (1988 drift counts the same as 2026 drift; reality
 *     has some institutional forgetting).
 */

import { updateState } from "../core/state.mjs";

/**
 * Drift dimensions tracked.
 */
export const DRIFT_AXES = [
  "judicial_power",
  "royal_discretion",
  "federalism",
  "expression_restriction",
  "religious_jurisdiction",
  "electoral_independence",
  "bumiputera_policy",
];

/**
 * Event-to-drift mapping. Each entry: identifier (matches event id or
 * description fragment), [{axis, delta}].
 *
 * delta convention: positive shifts toward the assertive/extending end,
 * negative shifts toward the restraining end. Range [-1, 1].
 */
const DRIFT_REGISTRY = [
  {
    match: { type: "ConstitutionalAmendment", articles_includes: "FC-Article-121(1)", year: 1988 },
    label: "1988 judicial-power amendment",
    deltas: { judicial_power: -0.50 },
  },
  {
    match: { type: "ConstitutionalAmendment", articles_includes: "FC-Article-121(1A)", year: 1988 },
    label: "1988 syariah-jurisdiction amendment",
    deltas: { religious_jurisdiction: 0.30 },
  },
  {
    match: { type: "TrialVerdict", court: "Federal-Court", description_includes: "Nik Elin" },
    label: "Nik Elin (2024) FC ruling on State List",
    deltas: { judicial_power: 0.10, religious_jurisdiction: -0.10 },
  },
  {
    match: { type: "ConstitutionalAmendment", description_includes: "Johor", description_includes_2: "appointed" },
    label: "Johor appointed-assemblymen amendment 2026",
    deltas: { electoral_independence: -0.10 },
  },
  {
    match: { description_includes: "CMA", description_includes_2: "s.233" },
    label: "CMA s.233 penalty escalation",
    deltas: { expression_restriction: 0.15 },
  },
  {
    match: { description_includes: "Sedition" },
    label: "Sedition Act case escalation",
    deltas: { expression_restriction: 0.10 },
  },
  {
    match: { type: "ConstitutionalAmendment", articles_includes: "FC-Article-153" },
    label: "Article 153 amendment cycle",
    deltas: { bumiputera_policy: 0.10 },
  },
  {
    match: { type: "PolicyAnnouncement", description_includes: "NEP" },
    label: "NEP launch 1971",
    deltas: { bumiputera_policy: 0.60, federalism: 0.10 },
  },
  {
    match: { type: "ConstitutionalAmendment", year_range: [1976, 1976], description_includes: "Sabah" },
    label: "1976 federalism reclassification",
    deltas: { federalism: -0.30 },
  },
  {
    match: { type: "RoyalIntervention", mechanism_includes: "decree-state-constitution" },
    label: "Royal Sultan-in-Council decree",
    deltas: { royal_discretion: 0.05 },
  },
];

function eventMatches(event, match) {
  if (match.type && event.type !== match.type) return false;
  if (match.year && (!event.date_start || !event.date_start.startsWith(String(match.year)))) return false;
  if (match.year_range && event.date_start) {
    const y = parseInt(event.date_start.slice(0, 4), 10);
    if (y < match.year_range[0] || y > match.year_range[1]) return false;
  }
  if (match.articles_includes && (!event.articles_affected ||
      !event.articles_affected.some(a => a.includes(match.articles_includes)))) return false;
  if (match.court && event.court !== match.court) return false;
  if (match.mechanism_includes && event.intervention_mechanism !== match.mechanism_includes) return false;
  const desc = [event.notes ?? "", event.policy_content_summary ?? "", event.allegation_summary ?? ""].join(" ");
  if (match.description_includes && !desc.toLowerCase().includes(match.description_includes.toLowerCase())) return false;
  if (match.description_includes_2 && !desc.toLowerCase().includes(match.description_includes_2.toLowerCase())) return false;
  return true;
}

/**
 * Identify the drift contribution of a single event.
 * Returns { label, deltas } or null if no match.
 */
function classifyDrift(event) {
  for (const entry of DRIFT_REGISTRY) {
    if (eventMatches(event, entry.match)) {
      return { label: entry.label, deltas: entry.deltas };
    }
  }
  return null;
}

/**
 * Compute the drift vector from a sequence of events.
 *
 * @param {Iterable} events — event records (from engine/sim/data/events/).
 * @returns {{ driftVector, provenance }}
 *   driftVector: { axis: cumulativeDelta }
 *   provenance: [{ eventId, label, deltas }] in chronological order.
 */
export function computeDrift(events) {
  const driftVector = Object.fromEntries(DRIFT_AXES.map(a => [a, 0]));
  const provenance = [];

  const sorted = [...events].sort((a, b) =>
    (a.date_start ?? "").localeCompare(b.date_start ?? ""));

  for (const event of sorted) {
    const match = classifyDrift(event);
    if (!match) continue;
    for (const [axis, delta] of Object.entries(match.deltas)) {
      if (driftVector[axis] === undefined) continue; // unknown axis, skip
      driftVector[axis] += delta;
    }
    provenance.push({
      eventId: event.id,
      date: event.date_start,
      eventType: event.type,
      label: match.label,
      deltas: match.deltas,
    });
  }

  return { driftVector, provenance };
}

/**
 * Run the drift mechanism on a state. State must carry an `events`
 * field (the events to compute drift over). For coalition-formation
 * pipelines, drift is informational — it doesn't change the coalition
 * directly, but it shifts cleavage salience for downstream mechanisms.
 *
 * Cleavage-salience update rule:
 *   - expression_restriction drift: increases reform-status-quo salience
 *   - judicial_power drift (negative): increases reform-status-quo salience
 *   - religious_jurisdiction drift: increases muslim-non-muslim salience
 *   - federalism drift (negative): increases peninsular-borneo salience
 *   - bumiputera_policy drift: increases bumi-non-bumi salience
 */
export function driftMechanism(state, options = {}) {
  const events = options.events ?? state.events ?? [];
  const result = computeDrift(events);

  const newSalience = { ...state.cleavageSalience };
  const dv = result.driftVector;
  if (Math.abs(dv.expression_restriction) > 0.1) {
    newSalience["reform-status-quo"] = Math.min(1, (newSalience["reform-status-quo"] ?? 0.5) + Math.abs(dv.expression_restriction) * 0.3);
  }
  if (dv.judicial_power < -0.1) {
    newSalience["reform-status-quo"] = Math.min(1, (newSalience["reform-status-quo"] ?? 0.5) + Math.abs(dv.judicial_power) * 0.2);
  }
  if (Math.abs(dv.religious_jurisdiction) > 0.1) {
    newSalience["muslim-non-muslim"] = Math.min(1, (newSalience["muslim-non-muslim"] ?? 0.5) + Math.abs(dv.religious_jurisdiction) * 0.3);
  }
  if (dv.federalism < -0.1) {
    newSalience["peninsular-borneo"] = Math.min(1, (newSalience["peninsular-borneo"] ?? 0.5) + Math.abs(dv.federalism) * 0.3);
  }
  if (Math.abs(dv.bumiputera_policy) > 0.1) {
    newSalience["bumi-non-bumi"] = Math.min(1, (newSalience["bumi-non-bumi"] ?? 0.5) + Math.abs(dv.bumiputera_policy) * 0.3);
  }

  return updateState(state, "drift",
    {
      cleavageSalience: newSalience,
      drift: {
        vector: dv,
        provenance: result.provenance,
        eventsProcessed: events.length,
        eventsMatched: result.provenance.length,
      },
    },
    {
      eventsMatched: result.provenance.length,
      strongestAxis: Object.entries(dv).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0],
    }
  );
}
