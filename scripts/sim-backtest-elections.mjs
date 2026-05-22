#!/usr/bin/env node
/**
 * Backtest the simulation pipeline against documented general elections
 * GE12 (2008), GE13 (2013), GE14 (2018), GE15 (2022).
 *
 * For each GE:
 *   1. Construct initial state with documented national coalition-level
 *      vote shares and party/coalition ideology positions.
 *   2. Run the full pipeline (outbidding -> electoral -> coalition ->
 *      patronage -> royal).
 *   3. Compute three metrics:
 *        - Per-coalition seat error (predicted vs documented).
 *        - Mean Absolute Percentage Error (MAPE) across all coalitions.
 *        - Governing-coalition Jaccard similarity (top-1 vs documented).
 *
 * Reports:
 *   - Per-GE table: predicted seats, actual seats, error, % error.
 *   - Aggregate calibration plot (text-based).
 *   - Pass criterion: MAPE < 25%, Jaccard >= 0.6 for governing coalition.
 *
 * Usage:
 *   node scripts/sim-backtest-elections.mjs
 *   node scripts/sim-backtest-elections.mjs --json
 *   node scripts/sim-backtest-elections.mjs --ge GE15
 */

import { createState } from "../engine/sim/core/state.mjs";
import { runPipeline } from "../engine/sim/core/pipeline.mjs";

const jsonOut = process.argv.includes("--json");
const onlyGE = process.argv.find((a, i) => process.argv[i - 1] === "--ge");

// --------------------------------------------------------------------------
// Documented elections.
//
// Sources: EC Malaysia official results, secondary aggregations in
// Wong Chin Huat / Merdeka Center / ISIS reports. Vote shares rounded
// to 1 decimal place; documented coalition formation per primary
// historical record.
// --------------------------------------------------------------------------

const GE12 = {
  name: "GE12 (8 March 2008)",
  date: "2008-03-08",
  totalSeats: 222,
  parties: [
    { id: "BN", name: "Barisan Nasional",
      rural_index: 0.45, regional_concentration: 0.05,
      ideology: { "ethnic-mobilisation": 0.45, "islamic-emphasis": 0.20, "centralisation-federal": 0.50, "reform-status-quo": -0.50 } },
    { id: "DAP", name: "Democratic Action Party",
      rural_index: -0.70, regional_concentration: 0.30,
      ideology: { "ethnic-mobilisation": -0.55, "islamic-emphasis": -0.40, "centralisation-federal": 0.05, "reform-status-quo": 0.65 } },
    { id: "PKR", name: "Parti Keadilan Rakyat",
      rural_index: -0.20, regional_concentration: 0.10,
      ideology: { "ethnic-mobilisation": -0.05, "islamic-emphasis": 0.10, "centralisation-federal": 0.20, "reform-status-quo": 0.70 } },
    { id: "PAS", name: "Parti Islam Se-Malaysia",
      rural_index: 0.80, regional_concentration: 0.25,
      ideology: { "ethnic-mobilisation": 0.65, "islamic-emphasis": 0.95, "centralisation-federal": 0.10, "reform-status-quo": -0.10 } },
    { id: "Indep", name: "Independents/Other", rural_index: 0.0, regional_concentration: 0.0,
      ideology: { "ethnic-mobilisation": 0.0, "islamic-emphasis": 0.0, "centralisation-federal": 0.0, "reform-status-quo": 0.0 } },
  ],
  voteShares: { BN: 0.514, PKR: 0.183, DAP: 0.138, PAS: 0.140, Indep: 0.025 },
  documentedSeats: { BN: 140, DAP: 28, PKR: 31, PAS: 23, Indep: 0 },
  documentedGoverning: ["BN"],
  blockedPairs: [["BN", "DAP"], ["BN", "PKR"], ["BN", "PAS"]],
  formateurId: "BN",
};

const GE13 = {
  name: "GE13 (5 May 2013)",
  date: "2013-05-05",
  totalSeats: 222,
  parties: [
    { id: "BN", name: "Barisan Nasional", rural_index: 0.50, regional_concentration: 0.05,
      ideology: { "ethnic-mobilisation": 0.45, "islamic-emphasis": 0.20, "centralisation-federal": 0.50, "reform-status-quo": -0.50 } },
    { id: "DAP", name: "DAP", rural_index: -0.70, regional_concentration: 0.30,
      ideology: { "ethnic-mobilisation": -0.55, "islamic-emphasis": -0.40, "centralisation-federal": 0.05, "reform-status-quo": 0.65 } },
    { id: "PKR", name: "PKR", rural_index: -0.20, regional_concentration: 0.10,
      ideology: { "ethnic-mobilisation": -0.05, "islamic-emphasis": 0.10, "centralisation-federal": 0.20, "reform-status-quo": 0.70 } },
    { id: "PAS", name: "PAS", rural_index: 0.80, regional_concentration: 0.55,
      ideology: { "ethnic-mobilisation": 0.65, "islamic-emphasis": 0.95, "centralisation-federal": 0.10, "reform-status-quo": -0.10 } },
  ],
  voteShares: { BN: 0.474, PKR: 0.207, DAP: 0.158, PAS: 0.146 },
  documentedSeats: { BN: 133, DAP: 38, PKR: 30, PAS: 21 },
  documentedGoverning: ["BN"],
  blockedPairs: [["BN", "DAP"], ["BN", "PKR"], ["BN", "PAS"]],
  formateurId: "BN",
};

const GE14 = {
  name: "GE14 (9 May 2018)",
  date: "2018-05-09",
  totalSeats: 222,
  parties: [
    { id: "BN", name: "Barisan Nasional", rural_index: 0.55, regional_concentration: 0.05,
      ideology: { "ethnic-mobilisation": 0.50, "islamic-emphasis": 0.25, "centralisation-federal": 0.55, "reform-status-quo": -0.45 } },
    { id: "PH", name: "Pakatan Harapan", rural_index: -0.05, regional_concentration: 0.10,
      ideology: { "ethnic-mobilisation": -0.10, "islamic-emphasis": -0.10, "centralisation-federal": 0.05, "reform-status-quo": 0.70 } },
    { id: "PAS", name: "PAS", rural_index: 0.80, regional_concentration: 0.55,
      ideology: { "ethnic-mobilisation": 0.65, "islamic-emphasis": 0.95, "centralisation-federal": 0.10, "reform-status-quo": -0.10 } },
    { id: "Warisan", name: "Warisan", rural_index: -0.10, regional_concentration: 0.40,
      ideology: { "ethnic-mobilisation": 0.10, "islamic-emphasis": -0.05, "centralisation-federal": -0.40, "reform-status-quo": 0.20 } },
    { id: "Indep", name: "Independents/Other", rural_index: 0.0, regional_concentration: 0.0,
      ideology: { "ethnic-mobilisation": 0.0, "islamic-emphasis": 0.0, "centralisation-federal": 0.0, "reform-status-quo": 0.0 } },
  ],
  voteShares: { PH: 0.456, BN: 0.337, PAS: 0.169, Warisan: 0.020, Indep: 0.018 },
  documentedSeats: { PH: 113, BN: 79, PAS: 18, Warisan: 8, Indep: 4 },
  documentedGoverning: ["PH", "Warisan"],
  blockedPairs: [["PH", "BN"], ["PH", "PAS"]],
  formateurId: "PH",
};

const GE15 = {
  name: "GE15 (19 November 2022)",
  date: "2022-11-19",
  totalSeats: 222,
  parties: [
    { id: "PH", name: "Pakatan Harapan", rural_index: -0.30, regional_concentration: 0.10,
      ideology: { "ethnic-mobilisation": -0.10, "islamic-emphasis": -0.10, "centralisation-federal": 0.05, "reform-status-quo": 0.55 } },
    { id: "PN", name: "Perikatan Nasional", rural_index: 0.20, regional_concentration: 0.30,
      ideology: { "ethnic-mobilisation": 0.75, "islamic-emphasis": 0.80, "centralisation-federal": 0.30, "reform-status-quo": -0.05 } },
    { id: "BN", name: "Barisan Nasional", rural_index: -0.50, regional_concentration: 0.05,
      legal_exposure: 0.85,
      ideology: { "ethnic-mobilisation": 0.50, "islamic-emphasis": 0.25, "centralisation-federal": 0.55, "reform-status-quo": -0.40 } },
    { id: "GPS", name: "GPS", rural_index: 0.80, regional_concentration: 0.95,
      ideology: { "ethnic-mobilisation": 0.20, "islamic-emphasis": 0.00, "centralisation-federal": -0.55, "reform-status-quo": -0.10 } },
    { id: "GRS", name: "GRS", rural_index: 0.40, regional_concentration: 0.85,
      ideology: { "ethnic-mobilisation": 0.25, "islamic-emphasis": 0.10, "centralisation-federal": -0.50, "reform-status-quo": -0.10 } },
    { id: "Warisan", name: "Warisan", rural_index: -0.10, regional_concentration: 0.40,
      ideology: { "ethnic-mobilisation": 0.10, "islamic-emphasis": -0.05, "centralisation-federal": -0.40, "reform-status-quo": 0.20 } },
    { id: "MUDA", name: "MUDA", rural_index: -0.30, regional_concentration: 0.10,
      ideology: { "ethnic-mobilisation": -0.30, "islamic-emphasis": -0.20, "centralisation-federal": 0.10, "reform-status-quo": 0.85 } },
  ],
  voteShares: { PH: 0.374, PN: 0.304, BN: 0.224, GPS: 0.060, GRS: 0.020, Warisan: 0.015, MUDA: 0.003 },
  documentedSeats: { PH: 82, PN: 74, BN: 30, GPS: 23, GRS: 6, Warisan: 3, MUDA: 1 },
  documentedGoverning: ["PH", "BN", "GPS", "GRS", "Warisan"],
  blockedPairs: [["PH", "PN"]],
  formateurId: "PH",
};

const ALL_GES = [GE12, GE13, GE14, GE15];

// --------------------------------------------------------------------------
// Metrics.
// --------------------------------------------------------------------------

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

function meanAbsolutePctError(predicted, actual) {
  const keys = Object.keys(actual);
  let sum = 0;
  let count = 0;
  for (const k of keys) {
    const a = actual[k];
    if (a === 0) continue; // skip 0-seat parties to avoid div by 0
    const p = predicted[k] ?? 0;
    sum += Math.abs(p - a) / a;
    count++;
  }
  return count > 0 ? (sum / count) : 0;
}

// --------------------------------------------------------------------------
// Backtest one election.
// --------------------------------------------------------------------------

function backtest(ge) {
  const initialState = createState({
    label: ge.name,
    asOfDate: ge.date,
    totalSeats: ge.totalSeats,
    parties: ge.parties,
    voteShares: ge.voteShares,
    blockedPairs: ge.blockedPairs,
    crisisIndicators: {},
  });

  const result = runPipeline(initialState, {
    stepOptions: {
      coalition: { formateurId: ge.formateurId, topK: 5 },
      royal: { crisisThreshold: 0.5 },
    },
  });

  // Extract predicted seats from post-electoral state.
  let electoralState = null;
  for (let i = result.trajectory.length - 1; i >= 0; i--) {
    if (result.trajectory[i].lastMechanism === "electoral") { electoralState = result.trajectory[i]; break; }
  }
  const predictedSeats = Object.fromEntries(electoralState.parties.map(p => [p.id, p.seats]));

  // Identify predicted governing coalition: post-patronage broadened if exists,
  // else post-royal broadened if exists, else natural top-1.
  const final = result.finalState;
  let predictedGoverning = [];
  let predictedSeatsCoalition = 0;
  if (final.coalition?.patronageAdjustedCoalition) {
    predictedGoverning = final.coalition.patronageAdjustedCoalition.members.map(m => m.id);
    predictedSeatsCoalition = final.coalition.patronageAdjustedCoalition.totalSeats;
  } else if (final.coalition?.broadenedCoalition) {
    predictedGoverning = final.coalition.broadenedCoalition.members.map(m => m.id);
    predictedSeatsCoalition = final.coalition.broadenedCoalition.totalSeats;
  } else if (final.coalition?.candidates?.length) {
    predictedGoverning = final.coalition.candidates[0].members.map(m => m.id);
    predictedSeatsCoalition = final.coalition.candidates[0].totalSeats;
  }

  const seatMAPE = meanAbsolutePctError(predictedSeats, ge.documentedSeats);
  const coalitionJaccard = jaccardSimilarity(predictedGoverning, ge.documentedGoverning);

  return {
    ge: ge.name,
    predictedSeats,
    documentedSeats: ge.documentedSeats,
    seatMAPE,
    predictedGoverning,
    documentedGoverning: ge.documentedGoverning,
    coalitionJaccard,
    predictedCoalitionSeats: predictedSeatsCoalition,
    pass: seatMAPE < 0.25 && coalitionJaccard >= 0.6,
  };
}

// --------------------------------------------------------------------------
// Run.
// --------------------------------------------------------------------------

const ges = onlyGE ? ALL_GES.filter(g => g.name.startsWith(onlyGE)) : ALL_GES;
const results = ges.map(backtest);

if (jsonOut) {
  process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  process.exit(results.every(r => r.pass) ? 0 : 1);
}

console.log("");
console.log("=".repeat(78));
console.log("ELECTION BACKTEST SUITE — GE12 / GE13 / GE14 / GE15");
console.log("=".repeat(78));

for (const r of results) {
  console.log("");
  console.log(`--- ${r.ge} ---`);
  console.log("");
  console.log("  Party     Predicted   Actual   Diff   AbsErr%");
  console.log("  -------   ---------   ------   ----   -------");
  for (const k of Object.keys(r.documentedSeats)) {
    const pred = r.predictedSeats[k] ?? 0;
    const actual = r.documentedSeats[k];
    const diff = pred - actual;
    const err = actual > 0 ? ((Math.abs(diff) / actual) * 100).toFixed(1) : "n/a";
    const diffStr = (diff >= 0 ? "+" : "") + diff;
    console.log(`  ${k.padEnd(8)}  ${String(pred).padStart(9)}   ${String(actual).padStart(6)}   ${diffStr.padStart(4)}   ${String(err).padStart(7)}`);
  }
  console.log("");
  console.log(`  Seat MAPE:              ${(r.seatMAPE * 100).toFixed(1)}%`);
  console.log(`  Predicted governing:    ${r.predictedGoverning.sort().join("+") || "(none)"} (${r.predictedCoalitionSeats} seats)`);
  console.log(`  Documented governing:   ${r.documentedGoverning.sort().join("+")}`);
  console.log(`  Coalition Jaccard:      ${r.coalitionJaccard.toFixed(2)}`);
  console.log(`  ${r.pass ? "PASS" : "FAIL"} (criterion: MAPE < 25%, Jaccard >= 0.60)`);
}

console.log("");
console.log("=".repeat(78));
console.log("AGGREGATE");
console.log("=".repeat(78));
const meanMAPE = results.reduce((s, r) => s + r.seatMAPE, 0) / results.length;
const meanJaccard = results.reduce((s, r) => s + r.coalitionJaccard, 0) / results.length;
const passed = results.filter(r => r.pass).length;
console.log("");
console.log(`  Mean seat MAPE across ${results.length} elections:    ${(meanMAPE * 100).toFixed(1)}%`);
console.log(`  Mean coalition Jaccard:                  ${meanJaccard.toFixed(2)}`);
console.log(`  ${passed}/${results.length} elections pass both criteria.`);
console.log("");

// ASCII calibration plot — predicted vs actual seats per coalition per GE
console.log("=".repeat(78));
console.log("CALIBRATION PLOT — predicted seats vs actual (each * = one coalition)");
console.log("=".repeat(78));
console.log("");
const allPairs = [];
for (const r of results) {
  for (const k of Object.keys(r.documentedSeats)) {
    if (r.documentedSeats[k] > 0 || (r.predictedSeats[k] ?? 0) > 0) {
      allPairs.push({ predicted: r.predictedSeats[k] ?? 0, actual: r.documentedSeats[k], label: `${r.ge.slice(0,4)}/${k}` });
    }
  }
}
const maxV = Math.max(...allPairs.flatMap(p => [p.predicted, p.actual]));
const range = Math.ceil(maxV / 10) * 10;
const cellSize = 5; // each grid cell = 5 seats
const grid = Array.from({ length: Math.ceil(range / cellSize) + 1 }, () => new Array(Math.ceil(range / cellSize) + 1).fill(" "));
for (const p of allPairs) {
  const xi = Math.round(p.predicted / cellSize);
  const yi = grid.length - 1 - Math.round(p.actual / cellSize);
  if (xi >= 0 && xi < grid[0].length && yi >= 0 && yi < grid.length) {
    grid[yi][xi] = grid[yi][xi] === " " ? "*" : "#";
  }
}
// Draw 45-degree line
for (let i = 0; i < grid.length; i++) {
  const j = grid.length - 1 - i;
  if (grid[i][j] === " ") grid[i][j] = ".";
}
// Print grid
console.log("           actual seats");
for (let i = 0; i < grid.length; i++) {
  const yval = (grid.length - 1 - i) * cellSize;
  console.log(`  ${String(yval).padStart(3)} |${grid[i].join("")}`);
}
const xAxis = grid[0].map((_, i) => i % 4 === 0 ? "+" : "-").join("");
console.log(`      +${xAxis}`);
const xLabels = grid[0].map((_, i) => i % 4 === 0 ? String(i * cellSize).padStart(4, " ") : "").join("").slice(0, grid[0].length + 4);
console.log(`       ${xLabels.replace(/\s+/g, " ")}`);
console.log("       predicted seats");
console.log("");
console.log("  Each * = one coalition's predicted vs actual seats in one election.");
console.log("  Dots (.) trace the perfect-calibration 45-degree line.");
console.log("  Points above the line are over-predicted; below are under-predicted.");
console.log("");

process.exit(passed === results.length ? 0 : 1);
