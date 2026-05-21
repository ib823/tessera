/**
 * State vector v0 — the minimal shape mechanism modules consume and produce.
 *
 * The full state vector S = (P, R, C, D, L, ρ) from the design doc §4.1 is
 * deferred to v1 (Phase 5 proper). This v0 carries only what the first
 * three mechanism modules (electoral, coalition, royal) actually need.
 * Extending the shape is allowed; removing fields requires an ADR.
 *
 * Discipline:
 * - State objects are IMMUTABLE. Mechanisms return a NEW state, never
 *   mutate the input. The `updateState` helper enforces this.
 * - Every state transition is tagged with `lastMechanism` so the pipeline
 *   composer can build an attribution report.
 * - `trace[]` accumulates one entry per mechanism step.
 */

/**
 * Create an initial state.
 *
 * @param {object} init
 * @param {string} init.label — human description, e.g., "GE15 2022 starting".
 * @param {string} init.asOfDate — ISO date.
 * @param {string} init.regimePeriod — P1..P7.
 * @param {Array}  init.parties — [{id, name, ideology, seats?}] (seats optional;
 *                  populated by electoral mechanism if absent).
 * @param {object} init.voteShares — { partyId: nationalVoteShare in [0,1] }.
 *                  Optional; required only if electoral mechanism is to run.
 * @param {number} init.totalSeats — assembly size (federal 222; varies by state).
 * @param {string} init.jurisdiction — "federal" | "sabah" | "sarawak" | state name.
 * @param {object} init.cleavageSalience — { cleavageId: 0..1 }.
 * @param {object} init.legitimacy — { institutionId: 0..1 }.
 * @param {Array}  init.blockedPairs — [[partyId, partyId], ...].
 * @param {object} init.crisisIndicators — { hungParliament: bool, defectionCascade: bool, ... }.
 */
export function createState(init) {
  return {
    label: init.label ?? "unlabeled",
    asOfDate: init.asOfDate,
    regimePeriod: init.regimePeriod,
    jurisdiction: init.jurisdiction ?? "federal",
    totalSeats: init.totalSeats,
    parties: init.parties ?? [],
    voteShares: init.voteShares ?? null,
    coalition: null,           // populated by coalition mechanism
    royalIntervention: null,   // populated by royal mechanism
    cleavageSalience: init.cleavageSalience ?? {},
    legitimacy: init.legitimacy ?? {},
    blockedPairs: init.blockedPairs ?? [],
    crisisIndicators: init.crisisIndicators ?? {},
    lastMechanism: null,
    trace: [],
  };
}

/**
 * Return a new state with `patch` merged in and a trace entry appended.
 * Pure: input state is not modified.
 */
export function updateState(state, mechanismName, patch, attribution = {}) {
  const next = { ...state, ...patch, lastMechanism: mechanismName };
  next.trace = [
    ...state.trace,
    {
      mechanism: mechanismName,
      timestamp: new Date().toISOString(),
      attribution,
    },
  ];
  return next;
}

/**
 * Sanity check: every cited cleavage / legitimacy actor / party id is
 * well-formed (ULID-or-short-id). For Phase 5 development, not strict —
 * just surfaces issues.
 */
export function checkState(state) {
  const issues = [];
  if (!state.totalSeats || state.totalSeats < 1) issues.push("totalSeats missing");
  if (!Array.isArray(state.parties) || state.parties.length === 0) issues.push("no parties");
  if (state.parties.some(p => p.seats != null && p.seats < 0)) issues.push("negative seats");
  if (state.voteShares) {
    const sum = Object.values(state.voteShares).reduce((s, v) => s + v, 0);
    if (sum < 0.95 || sum > 1.05) issues.push(`voteShares sum ${sum.toFixed(2)} not ~1`);
  }
  return issues;
}

/**
 * Helper: total seats currently allocated to parties (sum).
 */
export function totalAllocatedSeats(state) {
  return state.parties.reduce((s, p) => s + (p.seats ?? 0), 0);
}

/**
 * Helper: get party by id.
 */
export function partyById(state, id) {
  return state.parties.find(p => p.id === id) ?? null;
}
