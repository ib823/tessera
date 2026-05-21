#!/usr/bin/env node
/**
 * End-to-end pipeline calibration: electoral -> coalition -> royal.
 *
 * The integration test the design doc was built for: given GE15 voter
 * shares as starting state, can the engine pipeline reproduce the
 * documented Unity Government?
 *
 * Documented chain:
 *   1. GE15 vote shares -> Electoral mechanism -> seat distribution
 *      close to actual GE15 results (±20% per party for v0).
 *   2. Seat distribution -> Coalition mechanism -> natural top-K
 *      coalitions, with PH+GPS+GRS+Warisan at rank 1.
 *   3. Hung parliament triggers Royal mechanism -> broadens natural
 *      coalition by adding next-most-compatible party (BN).
 *   4. Final coalition contains PH+BN+GPS+GRS+Warisan = Unity Govt.
 *
 * If all four steps work, this is the engine's first true end-to-end
 * answer: GE15 -> Unity Government, with attribution showing which
 * mechanism contributed which transformation.
 *
 * Usage:
 *   node scripts/sim-test-pipeline.mjs
 *   node scripts/sim-test-pipeline.mjs --json
 */

import { createState } from "../engine/sim/core/state.mjs";
import { runPipeline, diffStates } from "../engine/sim/core/pipeline.mjs";

const jsonOut = process.argv.includes("--json");

// --------------------------------------------------------------------------
// GE15 starting state — vote shares from documented EC results (national).
// --------------------------------------------------------------------------

const ge15Parties = [
  {
    id: "PH",
    name: "Pakatan Harapan",
    rural_index: -0.30,
    ideology: {
      "ethnic-mobilisation": -0.10,
      "islamic-emphasis": -0.10,
      "economic-statist": 0.00,
      "centralisation-federal": 0.05,
      "reform-status-quo": 0.55,
    },
  },
  {
    id: "PN",
    name: "Perikatan Nasional",
    rural_index: 0.20,
    ideology: {
      "ethnic-mobilisation": 0.75,
      "islamic-emphasis": 0.80,
      "economic-statist": 0.40,
      "centralisation-federal": 0.30,
      "reform-status-quo": -0.05,
    },
  },
  {
    id: "BN",
    name: "Barisan Nasional",
    rural_index: -0.50,
    ideology: {
      "ethnic-mobilisation": 0.50,
      "islamic-emphasis": 0.25,
      "economic-statist": 0.30,
      "centralisation-federal": 0.55,
      "reform-status-quo": -0.40,
    },
  },
  {
    id: "GPS",
    name: "Gabungan Parti Sarawak",
    rural_index: 0.80,
    ideology: {
      "ethnic-mobilisation": 0.20,
      "islamic-emphasis": 0.00,
      "economic-statist": 0.20,
      "centralisation-federal": -0.55,
      "reform-status-quo": -0.10,
    },
  },
  {
    id: "GRS",
    name: "Gabungan Rakyat Sabah",
    rural_index: 0.40,
    ideology: {
      "ethnic-mobilisation": 0.25,
      "islamic-emphasis": 0.10,
      "economic-statist": 0.20,
      "centralisation-federal": -0.50,
      "reform-status-quo": -0.10,
    },
  },
  {
    id: "Warisan",
    name: "Warisan",
    rural_index: -0.10,
    ideology: {
      "ethnic-mobilisation": 0.10,
      "islamic-emphasis": -0.05,
      "economic-statist": 0.10,
      "centralisation-federal": -0.40,
      "reform-status-quo": 0.20,
    },
  },
  {
    id: "MUDA",
    name: "Malaysian United Democratic Alliance",
    rural_index: -0.30,
    ideology: {
      "ethnic-mobilisation": -0.30,
      "islamic-emphasis": -0.20,
      "economic-statist": -0.05,
      "centralisation-federal": 0.10,
      "reform-status-quo": 0.85,
    },
  },
];

const ge15VoteShares = {
  PH: 0.374,
  PN: 0.304,
  BN: 0.224,
  GPS: 0.060,
  GRS: 0.020,
  Warisan: 0.015,
  MUDA: 0.003,
};

const ge15ActualSeats = {
  PH: 82,
  PN: 74,
  BN: 30,
  GPS: 23,
  GRS: 6,
  Warisan: 3,
  MUDA: 1,
};

const initialState = createState({
  label: "GE15 federal 2022 — starting from vote shares",
  asOfDate: "2022-11-19",
  regimePeriod: "P7",
  jurisdiction: "federal",
  totalSeats: 222,
  parties: ge15Parties,
  voteShares: ge15VoteShares,
  blockedPairs: [
    ["PH", "PN"],
    ["PH", "PAS"], // legacy
  ],
  crisisIndicators: {
    constitutionalAmbiguity: false, // will be derived from hung parliament
    defectionCascade: false,
    scandalCascade: false,
  },
  cleavageSalience: {
    "bumi-non-bumi": 0.55,
    "muslim-non-muslim": 0.45,
    "peninsular-borneo": 0.60,
    "reform-status-quo": 0.65,
  },
});

// --------------------------------------------------------------------------
// Run the pipeline.
// --------------------------------------------------------------------------

const result = runPipeline(initialState, {
  stepOptions: {
    coalition: { formateurId: "PH", topK: 5 },
    royal: { crisisThreshold: 0.5 },
  },
});

const electoralState = result.trajectory[1];
const coalitionState = result.trajectory[2];
const finalState = result.finalState;

// --------------------------------------------------------------------------
// Validations.
//
// Two kinds: integration checks (pipeline composes end-to-end) and
// calibration reports (predicted vs documented, not test-failing).
// --------------------------------------------------------------------------

const checks = [];
const reports = [];

// Final coalition: prefer broadened if royal fired, else natural top-1.
const naturalTop = coalitionState.coalition.candidates[0];
const naturalIds = naturalTop ? naturalTop.members.map(m => m.id) : [];
const broadenedMembers = finalState.coalition?.broadenedCoalition?.members ?? [];
const broadenedIds = broadenedMembers.map(m => m.id);
const finalCoalitionIds = broadenedIds.length > 0 ? broadenedIds : naturalIds;
const finalCoalitionSeats = broadenedMembers.length > 0
  ? finalState.coalition.broadenedCoalition.totalSeats
  : naturalTop?.totalSeats ?? 0;

// INTEGRATION CHECKS — the pipeline must compose without errors.
checks.push({
  name: "Integration: electoral mechanism produces seats for every party",
  pass: electoralState.parties.every(p => Number.isInteger(p.seats) && p.seats >= 0),
});
checks.push({
  name: "Integration: electoral seats sum to totalSeats",
  pass: electoralState.parties.reduce((s, p) => s + p.seats, 0) === 222,
});
checks.push({
  name: "Integration: coalition mechanism returns >= 1 candidate",
  pass: coalitionState.coalition?.candidates?.length >= 1,
});
checks.push({
  name: "Integration: royal mechanism evaluates without error",
  pass: finalState.royalIntervention !== null,
});
checks.push({
  name: "Integration: trace records all three mechanisms in order",
  pass: finalState.trace.map(t => t.mechanism).join(",") === "electoral,coalition,royal",
});

// STRUCTURAL CHECKS — the pipeline output has the right SHAPE for GE15.
checks.push({
  name: "Structural: final coalition is PH-led (formateur PH is a member)",
  pass: finalCoalitionIds.includes("PH"),
  got: finalCoalitionIds.sort(),
});
checks.push({
  name: "Structural: final coalition includes BN (post-Sheraton political surprise)",
  pass: finalCoalitionIds.includes("BN"),
  got: finalCoalitionIds.sort(),
});
checks.push({
  name: "Structural: final coalition includes at least one Borneo bloc",
  pass: finalCoalitionIds.includes("GPS") || finalCoalitionIds.includes("GRS"),
  got: finalCoalitionIds.sort(),
});
checks.push({
  name: `Structural: final coalition has stability margin (>= 50%, got ${finalCoalitionSeats}/222)`,
  pass: finalCoalitionSeats >= 111,
});
checks.push({
  name: "Structural: PN is NOT in final coalition (PH-PN block holds)",
  pass: !finalCoalitionIds.includes("PN"),
  got: finalCoalitionIds.sort(),
});

// CALIBRATION REPORTS — predicted vs documented per party.
const seatsByParty = Object.fromEntries(electoralState.parties.map(p => [p.id, p.seats]));
for (const [pid, actual] of Object.entries(ge15ActualSeats)) {
  const predicted = seatsByParty[pid] ?? 0;
  const diff = predicted - actual;
  reports.push({
    party: pid,
    predicted,
    actual,
    diff,
    withinTolerance: Math.abs(diff) <= Math.max(2, actual * 0.20),
  });
}

// --------------------------------------------------------------------------
// Report.
// --------------------------------------------------------------------------

if (jsonOut) {
  process.stdout.write(JSON.stringify({
    initialState: {
      label: initialState.label,
      voteShares: initialState.voteShares,
      totalSeats: initialState.totalSeats,
    },
    electoral: {
      predictedSeats: seatsByParty,
      actualSeats: ge15ActualSeats,
    },
    coalition: {
      naturalTop1: {
        members: naturalIds,
        seats: naturalTop.totalSeats,
        weight: naturalTop.selectionWeight,
      },
      winningCoalitions: coalitionState.coalition.winningCoalitions,
    },
    royal: finalState.royalIntervention,
    finalCoalition: {
      members: broadenedIds.sort(),
      totalSeats: broadenedSeats,
    },
    attribution: result.attribution,
    checks,
    pass: checks.every(c => c.pass),
  }, null, 2) + "\n");
  process.exit(checks.every(c => c.pass) ? 0 : 1);
}

console.log("");
console.log("=".repeat(70));
console.log("PIPELINE CALIBRATION: GE15 -> Unity Government end-to-end");
console.log("=".repeat(70));
console.log("");

console.log("STAGE 1 — Electoral (vote shares -> seats)");
console.log("");
console.log("  Party     Vote%   Predicted  Actual  Diff");
console.log("  -------   -----   ---------  ------  ----");
for (const p of electoralState.parties) {
  const vote = (ge15VoteShares[p.id] * 100).toFixed(1).padStart(5);
  const pred = String(p.seats).padStart(9);
  const actual = String(ge15ActualSeats[p.id] ?? 0).padStart(6);
  const diff = (p.seats - (ge15ActualSeats[p.id] ?? 0));
  const diffStr = (diff >= 0 ? "+" : "") + diff;
  console.log(`  ${p.id.padEnd(8)}  ${vote}   ${pred}  ${actual}  ${diffStr}`);
}
console.log("");

console.log("STAGE 2 — Coalition (seats -> natural top-K)");
console.log("");
console.log(`  Winning coalitions enumerated: ${coalitionState.coalition.winningCoalitions}`);
console.log(`  Natural top-1: ${naturalTop.members.map(m => m.id).join("+")} (${naturalTop.totalSeats} seats, ${(naturalTop.selectionWeight * 100).toFixed(1)}% selection weight)`);
console.log("");

console.log("STAGE 3 — Royal (crisis check + broadening)");
console.log("");
if (finalState.royalIntervention?.fired) {
  console.log(`  Crisis level: ${finalState.royalIntervention.crisisLevel.toFixed(2)} (threshold ${finalState.royalIntervention.threshold})`);
  console.log(`  Mechanism: ${finalState.royalIntervention.mechanism}`);
  console.log(`  Natural -> Broadened:`);
  console.log(`    Natural:    ${finalState.royalIntervention.naturalCoalition.members.join("+")} (${finalState.royalIntervention.naturalCoalition.totalSeats} seats)`);
  console.log(`    Broadened:  ${finalState.royalIntervention.broadenedCoalition.members.join("+")} (${finalState.royalIntervention.broadenedCoalition.totalSeats} seats)`);
  console.log(`  Additions:`);
  for (const add of finalState.royalIntervention.additions) {
    console.log(`    + ${add.partyName} (${add.partyId}): +${add.seatsAdded} seats, ideology distance ${add.ideologyDistanceFromCentroid.toFixed(2)}`);
  }
} else {
  console.log(`  Royal intervention did NOT fire (crisis ${finalState.royalIntervention?.crisisLevel.toFixed(2) ?? "?"} below threshold)`);
}
console.log("");

console.log("FINAL — End-to-end output");
console.log("");
console.log(`  Final coalition: ${finalCoalitionIds.sort().join("+")}`);
console.log(`  Total seats:     ${finalCoalitionSeats} / 222 (${(finalCoalitionSeats / 222 * 100).toFixed(1)}%)`);
console.log(`  Source:          ${broadenedIds.length > 0 ? "post-royal broadening" : "coalition natural top-1 (no royal intervention)"}`);
console.log(`  Documented:      PH+BN+GPS+GRS+Warisan (Unity Government, 24 Nov 2022, Anwar PM)`);
console.log("");

console.log("=".repeat(70));
console.log("INTEGRATION + STRUCTURAL CHECKS");
console.log("=".repeat(70));
let passed = 0, failed = 0;
for (const c of checks) {
  const symbol = c.pass ? "PASS" : "FAIL";
  console.log(`  [${symbol}] ${c.name}`);
  if (!c.pass && c.got !== undefined) {
    console.log(`         got: ${JSON.stringify(c.got)}`);
    if (c.expected !== undefined) console.log(`         expected: ${JSON.stringify(c.expected)}`);
  }
  if (c.pass) passed++;
  else failed++;
}
console.log("");
console.log(`  ${passed}/${checks.length} checks passed.`);
console.log("");

console.log("=".repeat(70));
console.log("CALIBRATION REPORT — electoral mechanism vs documented GE15");
console.log("=".repeat(70));
console.log("");
console.log("  Party      Predicted   Actual   Diff   ±20%-tolerance");
console.log("  --------   ---------   ------   ----   --------------");
let withinTol = 0;
for (const r of reports) {
  const pid = r.party.padEnd(8);
  const pred = String(r.predicted).padStart(9);
  const actual = String(r.actual).padStart(6);
  const diff = (r.diff >= 0 ? "+" : "") + r.diff;
  const tol = r.withinTolerance ? "ok" : "OUT";
  if (r.withinTolerance) withinTol++;
  console.log(`  ${pid}   ${pred}   ${actual}   ${diff.padStart(4)}   ${tol}`);
}
console.log("");
console.log(`  ${withinTol}/${reports.length} parties within ±20% tolerance.`);
console.log(`  (Calibration tightening deferred to Phase 6 — see design doc §7.)`);
console.log("");

process.exit(failed > 0 ? 1 : 0);
