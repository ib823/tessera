#!/usr/bin/env node
/**
 * Brief-context query: produce an ENGINE CONTEXT markdown section for
 * Phase 1 brief authors.
 *
 * Per design doc §6.3 + §8.3:
 * - This output goes into engine/briefs/{slug}.md as a system-context
 *   section. It informs the writer's structural reasoning.
 * - It is NEVER published as a numerical claim in reader-facing cards.
 *   Calibration limits (mean MAPE 30.3% across GE12-15) are documented
 *   inline so the writer can read the output with appropriate skepticism.
 *
 * Usage:
 *   node scripts/sim-brief-context.mjs --scenario ge15-actual
 *   node scripts/sim-brief-context.mjs --scenario ge16-najib-pardon
 *   node scripts/sim-brief-context.mjs --vote-shares "PH:0.374,PN:0.304,..." --formateur PH --jurisdiction federal
 *   node scripts/sim-brief-context.mjs --seats "PH:82,PN:74,BN:30,..." --formateur PH
 *   node scripts/sim-brief-context.mjs --list-scenarios
 *
 * Output is markdown; redirect to file or paste directly into the brief.
 */

import { createState } from "../engine/sim/core/state.mjs";
import { runPipeline } from "../engine/sim/core/pipeline.mjs";

const args = process.argv.slice(2);

function argv(name, defaultVal = null) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : defaultVal;
}
function flag(name) {
  return args.includes(`--${name}`);
}

// --------------------------------------------------------------------------
// Built-in scenarios.
//
// Each scenario is { description, totalSeats, parties, voteShares?,
// seats?, formateurId, blockedPairs, crisisIndicators? }.
//
// Parties carry rural_index + legal_exposure (for the patronage module)
// + ideology vectors. Calibrated to engine seed records.
// --------------------------------------------------------------------------

const STANDARD_PARTIES = [
  { id: "PH", name: "Pakatan Harapan", rural_index: -0.30, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": -0.10, "islamic-emphasis": -0.10, "centralisation-federal": 0.05, "reform-status-quo": 0.55 } },
  { id: "PN", name: "Perikatan Nasional", rural_index: 0.20, legal_exposure: 0.20,
    ideology: { "ethnic-mobilisation": 0.75, "islamic-emphasis": 0.80, "centralisation-federal": 0.30, "reform-status-quo": -0.05 } },
  { id: "BN", name: "Barisan Nasional", rural_index: -0.50, legal_exposure: 0.85,
    ideology: { "ethnic-mobilisation": 0.50, "islamic-emphasis": 0.25, "centralisation-federal": 0.55, "reform-status-quo": -0.40 } },
  { id: "GPS", name: "Gabungan Parti Sarawak", rural_index: 0.80, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": 0.20, "islamic-emphasis": 0.00, "centralisation-federal": -0.55, "reform-status-quo": -0.10 } },
  { id: "GRS", name: "Gabungan Rakyat Sabah", rural_index: 0.40, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": 0.25, "islamic-emphasis": 0.10, "centralisation-federal": -0.50, "reform-status-quo": -0.10 } },
  { id: "Warisan", name: "Warisan", rural_index: -0.10, legal_exposure: 0.05,
    ideology: { "ethnic-mobilisation": 0.10, "islamic-emphasis": -0.05, "centralisation-federal": -0.40, "reform-status-quo": 0.20 } },
  { id: "MUDA", name: "MUDA", rural_index: -0.30, legal_exposure: 0.00,
    ideology: { "ethnic-mobilisation": -0.30, "islamic-emphasis": -0.20, "centralisation-federal": 0.10, "reform-status-quo": 0.85 } },
];

const SCENARIOS = {
  "ge15-actual": {
    description: "GE15 federal 2022 — actual documented seats (post-electoral, no electoral mechanism run).",
    totalSeats: 222,
    parties: STANDARD_PARTIES.map(p => ({ ...p, seats: { PH: 82, PN: 74, BN: 30, GPS: 23, GRS: 6, Warisan: 3, MUDA: 1 }[p.id] ?? 0 })),
    blockedPairs: [["PH", "PN"]],
    formateurId: "PH",
    jurisdiction: "federal",
  },
  "ge15-projected": {
    description: "GE15 federal 2022 — projected from vote shares through full pipeline.",
    totalSeats: 222,
    parties: STANDARD_PARTIES,
    voteShares: { PH: 0.374, PN: 0.304, BN: 0.224, GPS: 0.060, GRS: 0.020, Warisan: 0.015, MUDA: 0.003 },
    blockedPairs: [["PH", "PN"]],
    formateurId: "PH",
    jurisdiction: "federal",
  },
  "ge16-najib-pardon": {
    description: "GE16 projected — Najib full pardon scenario. BN recovers ~half of post-2018 Malay vote.",
    totalSeats: 222,
    parties: STANDARD_PARTIES,
    voteShares: { PH: 0.350, PN: 0.275, BN: 0.282, GPS: 0.060, GRS: 0.020, Warisan: 0.010, MUDA: 0.003 },
    blockedPairs: [["PH", "PN"]],
    formateurId: "PH",
    jurisdiction: "federal",
  },
  "ge16-pn-wave": {
    description: "GE16 projected — PN green-wave continuation, +5pp PAS/Bersatu.",
    totalSeats: 222,
    parties: STANDARD_PARTIES,
    voteShares: { PH: 0.345, PN: 0.380, BN: 0.180, GPS: 0.060, GRS: 0.020, Warisan: 0.012, MUDA: 0.003 },
    blockedPairs: [["PH", "PN"]],
    formateurId: "PH",
    jurisdiction: "federal",
  },
  "ge16-subsidy-fatigue": {
    description: "GE16 projected — cost-of-living + subsidy-rationalisation backlash erodes PH.",
    totalSeats: 222,
    parties: STANDARD_PARTIES,
    voteShares: { PH: 0.335, PN: 0.330, BN: 0.235, GPS: 0.060, GRS: 0.020, Warisan: 0.017, MUDA: 0.003 },
    blockedPairs: [["PH", "PN"]],
    formateurId: "PH",
    jurisdiction: "federal",
  },
};

// --------------------------------------------------------------------------
// Resolve scenario from CLI args.
// --------------------------------------------------------------------------

function parsePartyMap(s) {
  const out = {};
  for (const pair of s.split(",")) {
    const [k, v] = pair.split(":").map(x => x.trim());
    out[k] = Number(v);
  }
  return out;
}

function resolveScenario() {
  const scenarioName = argv("scenario");
  if (scenarioName) {
    if (!SCENARIOS[scenarioName]) {
      console.error(`Unknown scenario: ${scenarioName}. Use --list-scenarios.`);
      process.exit(1);
    }
    return { ...SCENARIOS[scenarioName], name: scenarioName };
  }

  const voteShares = argv("vote-shares");
  const seats = argv("seats");
  if (!voteShares && !seats) {
    console.error("Required: --scenario <name> OR --vote-shares <list> OR --seats <list>");
    process.exit(1);
  }

  const formateurId = argv("formateur");
  if (!formateurId) {
    console.error("Required: --formateur <party-id>");
    process.exit(1);
  }

  const jurisdiction = argv("jurisdiction", "federal");
  const totalSeats = Number(argv("total-seats", "222"));

  let parties = STANDARD_PARTIES;
  if (seats) {
    const seatMap = parsePartyMap(seats);
    parties = STANDARD_PARTIES.map(p => ({ ...p, seats: seatMap[p.id] ?? 0 }));
  }

  const voteSharesObj = voteShares ? parsePartyMap(voteShares) : null;
  const blockedRaw = argv("blocked-pairs", "PH-PN");
  const blockedPairs = blockedRaw.split(",").map(p => p.split("-").map(x => x.trim()));

  return {
    name: "custom",
    description: "Custom scenario (CLI input)",
    totalSeats,
    parties,
    voteShares: voteSharesObj,
    blockedPairs,
    formateurId,
    jurisdiction,
  };
}

// --------------------------------------------------------------------------
// Run pipeline + format markdown.
// --------------------------------------------------------------------------

function runAndFormat(scenario) {
  const state = createState({
    label: scenario.description,
    asOfDate: scenario.asOfDate ?? "scenario",
    totalSeats: scenario.totalSeats,
    parties: scenario.parties,
    voteShares: scenario.voteShares ?? null,
    blockedPairs: scenario.blockedPairs ?? [],
    jurisdiction: scenario.jurisdiction ?? "federal",
    crisisIndicators: scenario.crisisIndicators ?? {},
  });

  const result = runPipeline(state, {
    stepOptions: {
      coalition: { formateurId: scenario.formateurId, topK: 5 },
      royal: { crisisThreshold: 0.5 },
    },
  });

  let electoralState = null;
  for (let i = result.trajectory.length - 1; i >= 0; i--) {
    if (result.trajectory[i].lastMechanism === "electoral") { electoralState = result.trajectory[i]; break; }
  }
  const finalState = result.finalState;

  return { state, result, electoralState, finalState };
}

function fmt(scenario, run) {
  const { electoralState, finalState } = run;
  const lines = [];

  lines.push(`### ENGINE CONTEXT — ${scenario.name} (${scenario.jurisdiction ?? "federal"})`);
  lines.push("");
  lines.push("*Source: T4A simulation engine, 5-mechanism pipeline. **Internal use only — not for publication as numerical claims.** Engine MAPE on GE12-15 backtest is 30.3% (1/4 elections passes <25% threshold); qualitative coalition family is more reliable than specific seat counts.*");
  lines.push("");
  lines.push(`**Scenario:** ${scenario.description}`);
  lines.push("");

  // Inputs
  if (scenario.voteShares) {
    lines.push("**Inputs — vote shares:**");
    lines.push("");
    lines.push("| Party | Vote share |");
    lines.push("|---|---:|");
    for (const [k, v] of Object.entries(scenario.voteShares).sort((a, b) => b[1] - a[1])) {
      lines.push(`| ${k} | ${(v * 100).toFixed(1)}% |`);
    }
    lines.push("");
  }

  // Electoral output (if ran)
  if (electoralState && scenario.voteShares) {
    const seatsByParty = Object.fromEntries(electoralState.parties.map(p => [p.id, p.seats]));
    lines.push("**Electoral output (predicted seats):**");
    lines.push("");
    lines.push("| Party | Seats | Share |");
    lines.push("|---|---:|---:|");
    for (const [k, v] of Object.entries(seatsByParty).filter(([_, n]) => n > 0).sort((a, b) => b[1] - a[1])) {
      lines.push(`| ${k} | ${v} | ${(v / scenario.totalSeats * 100).toFixed(1)}% |`);
    }
    lines.push("");
  } else {
    lines.push("**Inputs — seats (electoral pass-through):**");
    lines.push("");
    lines.push("| Party | Seats |");
    lines.push("|---|---:|");
    for (const p of scenario.parties.filter(p => (p.seats ?? 0) > 0).sort((a, b) => (b.seats ?? 0) - (a.seats ?? 0))) {
      lines.push(`| ${p.id} | ${p.seats} |`);
    }
    lines.push("");
  }

  // Top-3 coalitions
  const candidates = finalState.coalition?.candidates ?? [];
  lines.push(`**Coalition mechanism — top-3 candidates (formateur ${scenario.formateurId}):**`);
  lines.push("");
  if (candidates.length === 0) {
    lines.push(`*No winning coalition reaches majority with formateur ${scenario.formateurId}. The formateur cannot form government with current seat distribution. Alternative formateur required.*`);
  } else {
    lines.push("| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |");
    lines.push("|---:|---|---:|---:|---:|---:|");
    candidates.slice(0, 3).forEach((c, i) => {
      const mem = c.members.map(m => m.id).sort().join("+");
      lines.push(`| ${i + 1} | ${mem} | ${c.totalSeats} | ${c.selectionWeight.toFixed(3)} | ${c.coherence.toFixed(2)} | ${c.expectedStabilityMonths} |`);
    });
  }
  lines.push("");

  // Patronage
  if (finalState.patronage?.entrants?.length > 0) {
    lines.push("**Patronage entrants (legal-exposure driven):**");
    lines.push("");
    for (const e of finalState.patronage.entrants) {
      lines.push(`- ${e.partyName} (${e.partyId}): legal exposure ${e.legalExposure.toFixed(2)}, entry margin ${e.entryMargin.toFixed(2)}`);
    }
    lines.push("");
  }

  // Royal intervention
  if (finalState.royalIntervention?.fired) {
    const r = finalState.royalIntervention;
    lines.push(`**Royal intervention — FIRED** (crisis ${r.crisisLevel.toFixed(2)}, threshold ${r.threshold}):`);
    lines.push("");
    lines.push(`- Natural: ${r.naturalCoalition.members.join("+")} (${r.naturalCoalition.totalSeats} seats)`);
    lines.push(`- Broadened: ${r.broadenedCoalition.members.join("+")} (${r.broadenedCoalition.totalSeats} seats)`);
    if (r.additions.length > 0) {
      lines.push(`- Additions: ${r.additions.map(a => `${a.partyName} +${a.seatsAdded}`).join(", ")}`);
    }
    lines.push("");
  } else {
    const cl = finalState.royalIntervention?.crisisLevel ?? 0;
    lines.push(`**Royal intervention:** did not fire (crisis ${cl.toFixed(2)} below threshold). Natural coalition stands.`);
    lines.push("");
  }

  // Structural reading — concise editorial summary
  lines.push("**Structural reading (for brief author):**");
  lines.push("");
  const top1 = candidates[0];
  if (top1) {
    const top1Ids = top1.members.map(m => m.id).sort();
    const hasBN = top1Ids.includes("BN");
    const hasPN = top1Ids.includes("PN");
    const hasPH = top1Ids.includes("PH");
    const hasBorneo = top1Ids.includes("GPS") || top1Ids.includes("GRS");
    lines.push(`- Natural top coalition is ${top1Ids.join("+")} (${top1.totalSeats}/${scenario.totalSeats} seats, ${(top1.totalSeats / scenario.totalSeats * 100).toFixed(1)}%).`);
    if (hasPH && hasBN) lines.push(`- PH-BN combination is in the natural coalition — the post-Sheraton political surprise of 2022.`);
    if (hasBorneo) lines.push(`- Borneo bloc (${top1Ids.filter(x => x === "GPS" || x === "GRS").join("/")}) is in the coalition; T4A issue 1705 (Borneo Affairs Ministry demand) is leverage to watch.`);
    if (!hasBN && hasPN) lines.push(`- PN-led coalition without BN — historically unusual; would require Muafakat-style realignment.`);
    if (!hasPH && hasPN) lines.push(`- PH excluded entirely — formateur ${scenario.formateurId} but cannot pull together a winning coalition. Alternative-formateur path opens.`);
  } else {
    lines.push(`- No formateur-${scenario.formateurId} winning coalition exists at current seat distribution.`);
    lines.push(`- This is itself a finding: the assumed formateur path is BLOCKED. Either the formateur must change, or coalition arithmetic must shift before government formation is possible.`);
  }

  // Known calibration warning
  lines.push("");
  lines.push("**Known calibration limits to read this output against:**");
  lines.push("");
  lines.push("- PAS seats typically over-predicted (rural-bias model misses regional concentration). If PAS is in the scenario, trim its predicted seats mentally by 20-40%.");
  lines.push("- BN seats under-predicted in dominant-party periods (base-erosion not modelled).");
  lines.push("- Engine does NOT capture: foreign-policy shocks, intra-party leadership crises, post-election defections, judicial rulings that re-shape institutions.");
  lines.push("");

  return lines.join("\n");
}

// --------------------------------------------------------------------------
// Main.
// --------------------------------------------------------------------------

if (flag("list-scenarios")) {
  console.log("Available scenarios:");
  console.log("");
  for (const [name, s] of Object.entries(SCENARIOS)) {
    console.log(`  ${name.padEnd(28)} ${s.description}`);
  }
  console.log("");
  console.log("Or pass --vote-shares / --seats with --formateur for custom scenarios.");
  process.exit(0);
}

const scenario = resolveScenario();
const run = runAndFormat(scenario);
process.stdout.write(fmt(scenario, run));
process.stdout.write("\n");
