#!/usr/bin/env node
/**
 * Stage 6 synthesis cross-check: surface engine reading and disagreement
 * candidates for the synthesizer to consider before finalizing cards.
 *
 * Per design doc §6.3 second integration point: when Stage 6 synthesis is
 * about to publish a claim about coalition arithmetic, royal arbitration,
 * or patronage, compare against engine reading. Disagreement = flag to
 * re-examine.
 *
 * Usage:
 *   node scripts/sim-stage6-check.mjs --scenario ge15-actual
 *   node scripts/sim-stage6-check.mjs --scenario ge16-najib-pardon --synthesis engine/output/{slug}-stage6-synthesis.json
 *   node scripts/sim-stage6-check.mjs --seats "..." --formateur PH
 *
 * Output is a markdown "Stage 6 Engine Cross-Check" block. Read it BEFORE
 * finalizing synthesis. If your synthesis claims contradict the engine
 * reading on coalition arithmetic / royal / patronage, you should EITHER
 * (a) have strong primary-source evidence the engine doesn't capture, OR
 * (b) revise the claim. Default to revise.
 */

import { createState } from "../engine/sim/core/state.mjs";
import { runPipeline } from "../engine/sim/core/pipeline.mjs";
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
function argv(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
}

const STANDARD_PARTIES = [
  { id: "PH", name: "Pakatan Harapan", rural_index: -0.30, regional_concentration: 0.10, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": -0.10, "islamic-emphasis": -0.10, "centralisation-federal": 0.05, "reform-status-quo": 0.55 } },
  { id: "PN", name: "Perikatan Nasional", rural_index: 0.20, regional_concentration: 0.30, legal_exposure: 0.20,
    ideology: { "ethnic-mobilisation": 0.75, "islamic-emphasis": 0.80, "centralisation-federal": 0.30, "reform-status-quo": -0.05 } },
  { id: "BN", name: "Barisan Nasional", rural_index: -0.50, regional_concentration: 0.05, legal_exposure: 0.85,
    ideology: { "ethnic-mobilisation": 0.50, "islamic-emphasis": 0.25, "centralisation-federal": 0.55, "reform-status-quo": -0.40 } },
  { id: "GPS", name: "GPS", rural_index: 0.80, regional_concentration: 0.95, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": 0.20, "islamic-emphasis": 0.00, "centralisation-federal": -0.55, "reform-status-quo": -0.10 } },
  { id: "GRS", name: "GRS", rural_index: 0.40, regional_concentration: 0.85, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": 0.25, "islamic-emphasis": 0.10, "centralisation-federal": -0.50, "reform-status-quo": -0.10 } },
  { id: "Warisan", name: "Warisan", rural_index: -0.10, regional_concentration: 0.40, legal_exposure: 0.05,
    ideology: { "ethnic-mobilisation": 0.10, "islamic-emphasis": -0.05, "centralisation-federal": -0.40, "reform-status-quo": 0.20 } },
  { id: "MUDA", name: "MUDA", rural_index: -0.30, regional_concentration: 0.10, legal_exposure: 0.00,
    ideology: { "ethnic-mobilisation": -0.30, "islamic-emphasis": -0.20, "centralisation-federal": 0.10, "reform-status-quo": 0.85 } },
];

const BUILTIN_SCENARIOS = {
  "ge15-actual": {
    seats: { PH: 82, PN: 74, BN: 30, GPS: 23, GRS: 6, Warisan: 3, MUDA: 1 },
    formateur: "PH",
  },
  "ge16-najib-pardon": {
    voteShares: { PH: 0.350, PN: 0.275, BN: 0.282, GPS: 0.060, GRS: 0.020, Warisan: 0.010, MUDA: 0.003 },
    formateur: "PH",
  },
};

function parsePartyMap(s) {
  const out = {};
  for (const p of s.split(",")) {
    const [k, v] = p.split(":").map(x => x.trim());
    out[k] = Number(v);
  }
  return out;
}

function loadScenario() {
  const name = argv("scenario");
  if (name) {
    if (!BUILTIN_SCENARIOS[name]) {
      console.error(`Unknown scenario: ${name}`);
      process.exit(1);
    }
    return { ...BUILTIN_SCENARIOS[name], name };
  }
  const seats = argv("seats");
  const voteShares = argv("vote-shares");
  if (!seats && !voteShares) {
    console.error("Required: --scenario OR --seats OR --vote-shares");
    process.exit(1);
  }
  const formateur = argv("formateur") ?? "PH";
  return {
    name: "custom",
    seats: seats ? parsePartyMap(seats) : null,
    voteShares: voteShares ? parsePartyMap(voteShares) : null,
    formateur,
  };
}

function buildState(scenario) {
  const parties = scenario.seats
    ? STANDARD_PARTIES.map(p => ({ ...p, seats: scenario.seats[p.id] ?? 0 }))
    : STANDARD_PARTIES;
  return createState({
    label: `Stage 6 cross-check: ${scenario.name}`,
    totalSeats: 222,
    parties,
    voteShares: scenario.voteShares ?? null,
    blockedPairs: [["PH", "PN"]],
    crisisIndicators: {},
  });
}

const scenario = loadScenario();
const state = buildState(scenario);
const result = runPipeline(state, {
  stepOptions: {
    coalition: { formateurId: scenario.formateur, topK: 5 },
    royal: { crisisThreshold: 0.5 },
  },
});

const final = result.finalState;
const topCandidate = final.coalition?.candidates?.[0];
const broadened = final.coalition?.broadenedCoalition;
const patronage = final.patronage;

// Optional: load synthesis JSON and compare.
let synthesisAlignment = null;
const synthesisPath = argv("synthesis");
if (synthesisPath && existsSync(synthesisPath)) {
  try {
    const synthesis = JSON.parse(readFileSync(synthesisPath, "utf8"));
    synthesisAlignment = compareSynthesis(synthesis, final, topCandidate, broadened);
  } catch (e) {
    console.error(`Failed to load synthesis: ${e.message}`);
  }
}

function compareSynthesis(synthesis, final, topCandidate, broadened) {
  const flags = [];
  const text = JSON.stringify(synthesis).toLowerCase();
  const enginePicksBN = (broadened?.members ?? topCandidate?.members ?? []).some(m => m.id === "BN");
  const engineRoyalFired = final.royalIntervention?.fired ?? false;
  const enginePatronageEntrant = (patronage?.entrants ?? []).some(e => e.partyId === "BN");

  if (enginePicksBN && (text.includes("bn excluded") || text.includes("bn was not in") || text.includes("rejected bn"))) {
    flags.push({
      severity: "high",
      claim: "synthesis suggests BN was excluded from coalition",
      engineReading: "engine reads BN as IN the natural/broadened coalition",
      action: "verify primary sources or revise claim",
    });
  }
  if (engineRoyalFired && (text.includes("royal had no role") || text.includes("without royal intervention"))) {
    flags.push({
      severity: "high",
      claim: "synthesis denies royal role",
      engineReading: `engine reads royal intervention as FIRED (crisis ${final.royalIntervention?.crisisLevel?.toFixed(2)})`,
      action: "verify or revise",
    });
  }
  if (enginePatronageEntrant && !text.includes("court cluster") && !text.includes("legal exposure") && !text.includes("dnaa")) {
    flags.push({
      severity: "medium",
      claim: "synthesis does not mention Court Cluster / legal-exposure dynamics",
      engineReading: "engine reads BN entry as patronage-driven (legal exposure 0.85)",
      action: "consider adding the structural angle as reframe or view card content",
    });
  }
  return flags;
}

// --------------------------------------------------------------------------
// Output.
// --------------------------------------------------------------------------

const out = [];
out.push("# Stage 6 Engine Cross-Check");
out.push("");
out.push(`**Scenario:** ${scenario.name}`);
out.push(`**Generated:** ${new Date().toISOString()}`);
out.push("");
out.push("*Read this BEFORE finalizing synthesis cards. If your synthesis claims contradict the engine reading below on coalition arithmetic / royal arbitration / patronage, you should EITHER (a) have strong primary-source evidence the engine doesn't capture, OR (b) revise the claim. Default to revise.*");
out.push("");

out.push("## Engine reading");
out.push("");
if (topCandidate) {
  const memIds = topCandidate.members.map(m => m.id).sort().join("+");
  out.push(`- **Natural top-1 coalition:** ${memIds} (${topCandidate.totalSeats}/${state.totalSeats} seats, ${(topCandidate.totalSeats / state.totalSeats * 100).toFixed(1)}%, selection weight ${topCandidate.selectionWeight.toFixed(3)}).`);
} else {
  out.push(`- **No winning coalition with formateur ${scenario.formateur}** — formateur path is BLOCKED at this seat distribution. Alternative formateur required.`);
}
if (broadened) {
  out.push(`- **Royal-broadened coalition:** ${broadened.members.map(m => m.id).sort().join("+")} (${broadened.totalSeats} seats).`);
}
if (final.royalIntervention?.fired) {
  out.push(`- **Royal intervention fired** (crisis ${final.royalIntervention.crisisLevel.toFixed(2)}, threshold ${final.royalIntervention.threshold}).`);
} else {
  out.push(`- **Royal intervention did NOT fire** (crisis ${final.royalIntervention?.crisisLevel?.toFixed(2) ?? "n/a"} below threshold).`);
}
if (patronage?.entrants?.length > 0) {
  out.push(`- **Patronage legal-exposure entrants:** ${patronage.entrants.map(e => `${e.partyId} (exposure ${e.legalExposure.toFixed(2)})`).join("; ")}.`);
}
out.push("");

out.push("## Stage 6 review questions");
out.push("");
out.push("1. Does the synthesis's coalition-related claim (if any) name the same parties the engine names? If not, why?");
out.push("2. Does the synthesis attribute outcomes to royal arbitration / single-actor agency / patronage logic, and does that attribution match the engine's mechanism breakdown?");
out.push("3. If the engine identifies Court Cluster patronage as a driver, has the synthesis acknowledged the legal-exposure structural angle (suitable for reframe card)?");
out.push("4. Has the synthesis avoided publishing numerical engine output (per design doc §8.3)?");
out.push("");

if (synthesisAlignment !== null) {
  out.push("## Automated disagreement flags");
  out.push("");
  if (synthesisAlignment.length === 0) {
    out.push("*No automated flags raised. (Note: the keyword-based check is coarse — manual review against the questions above is the load-bearing step.)*");
  } else {
    for (const flag of synthesisAlignment) {
      out.push(`**[${flag.severity.toUpperCase()}] ${flag.claim}**`);
      out.push("");
      out.push(`- Engine reading: ${flag.engineReading}`);
      out.push(`- Action: ${flag.action}`);
      out.push("");
    }
  }
}

out.push("## Known limits");
out.push("");
out.push("- Engine MAPE on GE12-15 backtest is ~28-30% per-coalition. Trust qualitative coalition family over specific seat counts.");
out.push("- Engine cannot model: foreign-policy shocks, individual leadership crises, court rulings that re-shape institutions, exogenous economic shocks.");
out.push("- Engine knows only the mechanisms documented in `docs/research/malaysia-political-simulation-engine.md`. Anything outside that scope is the synthesizer's domain.");

process.stdout.write(out.join("\n") + "\n");
