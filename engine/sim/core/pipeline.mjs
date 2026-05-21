/**
 * Pipeline composer — chains mechanism modules into an end-to-end
 * simulation trajectory.
 *
 * Per design doc §6.2:
 *   For each t:
 *     1. Sample exogenous shock ε_t          (deferred to Phase 5)
 *     2. Sample each actor's action a_i      (deferred — bounded-rationality)
 *     3. Apply f_institutional               (mechanism modules)
 *     4. Apply f_political                   (mechanism modules)
 *     5. Update belief posteriors            (deferred to Phase 5)
 *     6. Update salience vector              (mechanism-internal)
 *     7. Check regime-transition trigger     (deferred to Phase 5)
 *     8. Emit S_{t+1}
 *
 * The v0 composer implements (3)-(4) only: a deterministic chain of
 * mechanism modules called in order. Stochasticity comes from each
 * mechanism's own softmax sampling (already in §5.1).
 *
 * Default pipeline for coalition-formation contexts:
 *   electoral -> coalition -> royal
 *
 * Custom pipelines: pass an array of {name, fn, options} steps.
 */

import { electoralMechanism } from "../mechanisms/electoral.mjs";
import { royalMechanism } from "../mechanisms/royal.mjs";
import { patronageMechanism } from "../mechanisms/patronage.mjs";
import { outbiddingMechanism } from "../mechanisms/outbidding.mjs";
import { formCoalition } from "../mechanisms/coalition.mjs";
import { updateState } from "./state.mjs";

/**
 * Coalition mechanism adapter — turns the standalone formCoalition()
 * into a state-transformer compatible with the pipeline.
 */
export function coalitionMechanism(state, options = {}) {
  const parties = state.parties.map(p => ({
    id: p.id,
    name: p.name,
    seats: p.seats ?? 0,
    ideology: p.ideology,
  }));

  const result = formCoalition(parties, {
    totalSeats: state.totalSeats,
    blockedPairs: state.blockedPairs,
    formateurId: options.formateurId,
    topK: options.topK ?? 5,
    temperature: options.temperature ?? 0.5,
    weights: options.weights,
    dominantAxis: options.dominantAxis,
  });

  return updateState(state, "coalition",
    { coalition: result },
    {
      formateur: result.formateur.id,
      winningCoalitions: result.winningCoalitions,
      topCandidate: {
        members: result.candidates[0]?.members.map(m => m.id),
        seats: result.candidates[0]?.totalSeats,
        selectionWeight: result.candidates[0]?.selectionWeight,
      },
    }
  );
}

/**
 * Default pipeline order. Rationale:
 *
 *   outbidding -> electoral
 *     Outbidding shifts party positions BEFORE votes are translated to
 *     seats. (For backtests with observed vote shares, outbidding is a
 *     no-op-equivalent — positions affect downstream coalition
 *     compatibility but not the input vote shares themselves.)
 *
 *   electoral -> coalition
 *     Seats are the coalition mechanism's input.
 *
 *   coalition -> patronage
 *     Patronage operates on the natural coalition: allocates ledger
 *     by Gamson + cabinet premium, and adds legal-exposure entrants.
 *
 *   patronage -> royal
 *     Royal arbitration operates last, broadening for stability if
 *     the patronage-adjusted coalition still has a thin margin.
 */
const DEFAULT_STEPS = [
  { name: "outbidding", fn: outbiddingMechanism },
  { name: "electoral", fn: electoralMechanism },
  { name: "coalition", fn: coalitionMechanism },
  { name: "patronage", fn: patronageMechanism },
  { name: "royal", fn: royalMechanism },
];

/**
 * Run a pipeline of mechanisms on an initial state.
 *
 * @param {object} initialState
 * @param {object} options
 * @param {Array}  options.steps — [{name, fn, options}, ...] overriding default.
 * @returns {{ finalState, trajectory, attribution }}
 */
export function runPipeline(initialState, options = {}) {
  const steps = options.steps ?? DEFAULT_STEPS;
  const stepOptions = options.stepOptions ?? {};

  const trajectory = [initialState];
  let state = initialState;
  for (const step of steps) {
    state = step.fn(state, stepOptions[step.name] ?? step.options ?? {});
    trajectory.push(state);
  }

  return {
    finalState: state,
    trajectory,
    attribution: buildAttribution(state),
  };
}

/**
 * Build a per-mechanism attribution report from the final state's trace.
 */
export function buildAttribution(state) {
  const byMechanism = {};
  for (const entry of state.trace) {
    byMechanism[entry.mechanism] = entry.attribution;
  }
  return byMechanism;
}

/**
 * Diff between two states — surface what changed at each step. Useful for
 * understanding which mechanism contributed which transformation.
 */
export function diffStates(before, after) {
  const out = {};
  if (before.parties?.[0]?.seats !== after.parties?.[0]?.seats) {
    out.seatsChanged = true;
  }
  if (!before.coalition && after.coalition) out.coalitionAdded = true;
  if (before.coalition && after.coalition?.broadenedCoalition !== before.coalition?.broadenedCoalition) {
    out.coalitionBroadened = true;
  }
  if (!before.royalIntervention && after.royalIntervention) {
    out.royalInterventionFired = after.royalIntervention.fired;
  }
  return out;
}
