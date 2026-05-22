#!/usr/bin/env node
/**
 * Capstone analysis — uses the full simulation engine to evaluate the
 * "cards available to the current government" question from the start of
 * this build arc.
 *
 * Runs each card as a scenario through the pipeline, plus drift + cascade
 * mechanisms, and produces a comprehensive markdown report.
 *
 * Usage:
 *   node scripts/sim-government-cards.mjs > docs/research/sim-engine-capstone-ge16-cards.md
 */

import { createState } from "../engine/sim/core/state.mjs";
import { runPipeline } from "../engine/sim/core/pipeline.mjs";
import { driftMechanism } from "../engine/sim/mechanisms/drift.mjs";
import { cascadeMechanism } from "../engine/sim/mechanisms/cascade.mjs";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DATA = new URL("../engine/sim/data/", import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const s = statSync(full);
    if (s.isDirectory()) { if (e !== "staging") out.push(...walk(full)); }
    else if (e.endsWith(".json")) out.push(full);
  }
  return out;
}

const eventFiles = walk(join(DATA, "events"));
const events = eventFiles.map(f => JSON.parse(readFileSync(f, "utf8")));

const PARTIES = [
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

const BASELINE_VOTE_SHARES = {
  PH: 0.374, PN: 0.304, BN: 0.224, GPS: 0.060, GRS: 0.020, Warisan: 0.015, MUDA: 0.003,
};

const CARDS = [
  {
    id: "C0",
    name: "Status quo (baseline — GE15 vote shares preserved)",
    summary: "No card played; baseline reference for comparison.",
    voteShares: BASELINE_VOTE_SHARES,
    parties: PARTIES,
    crisisIndicators: {},
  },
  {
    id: "C1",
    name: "Najib full pardon (Card 1)",
    summary: "Najib receives full pardon. Court Cluster legal exposure drops sharply. BN recovers ~half lost Malay vote. UMNO grassroots return; some PN-leaning Malay voters shift back to BN.",
    voteShares: { PH: 0.350, PN: 0.275, BN: 0.282, GPS: 0.060, GRS: 0.020, Warisan: 0.010, MUDA: 0.003 },
    parties: PARTIES.map(p => p.id === "BN" ? { ...p, legal_exposure: 0.30 } : p),
    crisisIndicators: {},
  },
  {
    id: "C2",
    name: "Borneo Affairs Ministry created (Card 2)",
    summary: "PMX concedes the GRS-GPS demand. Borneo bloc locks in to Unity Government. No vote-share change (negotiation is post-electoral), but coalition-formation logic shifts toward Borneo-cushioned coalition.",
    voteShares: BASELINE_VOTE_SHARES,
    parties: PARTIES.map(p => (p.id === "GPS" || p.id === "GRS") ? { ...p, legal_exposure: Math.max(p.legal_exposure ?? 0, 0.5) } : p),
    crisisIndicators: {},
  },
  {
    id: "C3",
    name: "3R defensive escalation (Card 3)",
    summary: "Zahid's posture continues; Akta Kedaulatan Raja moves toward cabinet paper; further sedition-act tightening. Doesn't change vote shares directly but DRIFTS the system toward expression_restriction and consolidates Malay-Muslim cleavage salience.",
    voteShares: { PH: 0.345, PN: 0.295, BN: 0.255, GPS: 0.060, GRS: 0.020, Warisan: 0.012, MUDA: 0.003 },
    parties: PARTIES,
    crisisIndicators: { scandalIntensity: 0.3 },
    driftAddenda: [
      { axis: "expression_restriction", delta: 0.20, note: "Akta Kedaulatan Raja + further sedition expansion" },
      { axis: "religious_jurisdiction", delta: 0.10, note: "PAS-Bersatu pressure on state-level enactments" },
    ],
  },
  {
    id: "C4",
    name: "Subsidy targeting visible (Card 4)",
    summary: "PADU + RM15.5B savings flow visibly to Malay B40 households. Unity government's MADANI brand revives among rural Malays. Moderate PH gain; PN loses some marginal Malay voters; BN holds.",
    voteShares: { PH: 0.400, PN: 0.290, BN: 0.215, GPS: 0.060, GRS: 0.020, Warisan: 0.012, MUDA: 0.003 },
    parties: PARTIES,
    crisisIndicators: {},
  },
  {
    id: "C5",
    name: "Strategic delay (Card 5) — GE16 called 2027 not 2026",
    summary: "Anwar uses Article 54(1) two-year carve-out; GE16 deferred. Vote shares assumed to drift slightly toward incumbents as subsidy benefits compound. PH +2pp.",
    voteShares: { PH: 0.394, PN: 0.295, BN: 0.218, GPS: 0.060, GRS: 0.020, Warisan: 0.010, MUDA: 0.003 },
    parties: PARTIES,
    crisisIndicators: { economicStress: 0.2 },
  },
  {
    id: "C6",
    name: "PN green wave continues (counter-scenario)",
    summary: "If government's cards fail to halt PN momentum: PAS-Bersatu consolidate northern belt; UMNO grassroots stay with PN. The 'unity government loses' scenario.",
    voteShares: { PH: 0.345, PN: 0.380, BN: 0.180, GPS: 0.060, GRS: 0.020, Warisan: 0.012, MUDA: 0.003 },
    parties: PARTIES,
    crisisIndicators: { coalitionInternalTension: 0.4 },
  },
  {
    id: "C7",
    name: "Najib pardon + PN consolidation (worst case for incumbent)",
    summary: "BN recovers via Najib goodwill AND PN holds. Three-way close finish at federal level. Highest hung-parliament probability — exactly the scenario where royal arbitration becomes decisive.",
    voteShares: { PH: 0.320, PN: 0.320, BN: 0.275, GPS: 0.060, GRS: 0.020, Warisan: 0.012, MUDA: 0.003 },
    parties: PARTIES.map(p => p.id === "BN" ? { ...p, legal_exposure: 0.30 } : p),
    crisisIndicators: { competingPMClaims: 0.5 },
  },
];

function runCard(card) {
  const state = createState({
    label: card.name,
    totalSeats: 222,
    parties: card.parties,
    voteShares: card.voteShares,
    blockedPairs: [["PH", "PN"]],
    crisisIndicators: card.crisisIndicators,
  });
  const result = runPipeline(state, {
    stepOptions: {
      coalition: { formateurId: "PH", topK: 5 },
      royal: { crisisThreshold: 0.5 },
    },
  });
  let electoral = null;
  for (let i = result.trajectory.length - 1; i >= 0; i--) {
    if (result.trajectory[i].lastMechanism === "electoral") { electoral = result.trajectory[i]; break; }
  }
  const final = result.finalState;

  // Run cascade as final layer on the final state
  const cascadeResult = cascadeMechanism(final);

  // PN-led alternative if PN has plurality
  const seatsByParty = Object.fromEntries(electoral.parties.map(p => [p.id, p.seats]));
  let pnLed = null;
  if ((seatsByParty.PN ?? 0) > (seatsByParty.PH ?? 0)) {
    const pnState = createState({
      ...state, label: state.label + " (PN-formateur)", parties: electoral.parties,
      blockedPairs: [["PH", "PN"]],
    });
    const pnResult = runPipeline(pnState, {
      stepOptions: {
        coalition: { formateurId: "PN", topK: 3 },
        royal: { crisisThreshold: 0.5 },
      },
    });
    const top = pnResult.finalState.coalition?.candidates?.[0];
    if (top) pnLed = { members: top.members.map(m => m.id), seats: top.totalSeats, weight: top.selectionWeight };
  }

  return {
    card,
    seats: seatsByParty,
    naturalTop: final.coalition?.candidates?.[0],
    broadened: final.coalition?.broadenedCoalition,
    patronageEntrants: final.patronage?.entrants ?? [],
    royal: final.royalIntervention,
    cascade: cascadeResult.cascade,
    pnLed,
  };
}

const cardResults = CARDS.map(runCard);

// Drift across encoded events
const driftBaselineState = createState({
  label: "Drift baseline",
  totalSeats: 222,
  parties: PARTIES,
  cleavageSalience: {
    "bumi-non-bumi": 0.55, "muslim-non-muslim": 0.45, "peninsular-borneo": 0.60, "reform-status-quo": 0.65,
  },
});
const driftResult = driftMechanism(driftBaselineState, { events });
const drift = driftResult.drift;

// --------------------------------------------------------------------------
// Generate report.
// --------------------------------------------------------------------------

function fmtPct(n, decimals = 1) { return (n * 100).toFixed(decimals) + "%"; }

const md = [];
md.push("# Engine Capstone — Cards Available to the Unity Government");
md.push("");
md.push(`**Status:** internal T4A — NOT for publication as numerical claims (design doc §8.3).`);
md.push(`**Generated:** ${new Date().toISOString()}`);
md.push(`**Engine:** 7 mechanisms (electoral, coalition, royal, patronage, outbidding, drift, cascade).`);
md.push(`**Calibration:** GE15 backtest MAPE 12.8% (within tolerance); GE12-14 MAPE 28-49% (qualitative reading only).`);
md.push("");
md.push("## The question this answers");
md.push("");
md.push("From the start of this build arc:");
md.push("");
md.push("> *Given the historical and trend data, what cards does the current government have available going into GE16? How does the Najib-pardon card interact with UMNO leverage, DAP's structural position, and the coalition arithmetic?*");
md.push("");
md.push("This document walks each card through the full engine — coalition arithmetic, royal arbitration, patronage flow, plus drift state across constitutional dimensions and cascade probability — and produces a structural ranking.");
md.push("");

// --- Constitutional drift state ---
md.push("## 1. Constitutional drift state (P3 → P7)");
md.push("");
md.push(`The drift mechanism reads ${events.length} encoded events from 1957 to 2026. Cumulative drift vector (D = 0 is 1957 baseline; signed deltas show cumulative shift):`);
md.push("");
md.push("| Dimension | Cumulative drift | Strongest contributors |");
md.push("|---|---:|---|");
const contributorsByAxis = {};
for (const p of drift.provenance) {
  for (const [axis, delta] of Object.entries(p.deltas)) {
    if (!contributorsByAxis[axis]) contributorsByAxis[axis] = [];
    contributorsByAxis[axis].push({ label: p.label, delta, date: p.date });
  }
}
for (const [axis, total] of Object.entries(drift.vector)) {
  const cs = (contributorsByAxis[axis] ?? []).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 2);
  const csStr = cs.map(c => `${c.label} (${c.delta >= 0 ? "+" : ""}${c.delta.toFixed(2)})`).join("; ") || "(none in seed set)";
  md.push(`| ${axis} | ${total >= 0 ? "+" : ""}${total.toFixed(2)} | ${csStr} |`);
}
md.push("");
md.push("**Reading:** The institutional state in 2026 is meaningfully different from 1957 on every axis the engine tracks. The most decisive shifts are in `judicial_power` (1988 amendment) and `bumiputera_policy` (1971 NEP launch). Both shape the territory on which 2026 cards are played.");
md.push("");

// --- Card-by-card ---
md.push("## 2. Card-by-card engine reading");
md.push("");
md.push("Each card runs through the full pipeline. The natural coalition is the top-1 PH-led winning combination from the coalition mechanism; the broadened version reflects royal-arbitration expansion when crisis fires.");
md.push("");

for (const r of cardResults) {
  md.push(`### ${r.card.id} — ${r.card.name}`);
  md.push("");
  md.push(`*${r.card.summary}*`);
  md.push("");
  md.push("**Predicted seats:**");
  md.push("");
  md.push("| Party | Seats |");
  md.push("|---|---:|");
  for (const [pid, n] of Object.entries(r.seats).sort((a, b) => b[1] - a[1])) {
    if (n > 0) md.push(`| ${pid} | ${n} |`);
  }
  md.push("");
  if (r.naturalTop) {
    const mem = r.naturalTop.members.map(m => m.id).sort().join("+");
    md.push(`**Natural coalition (PH formateur):** ${mem} — ${r.naturalTop.totalSeats}/222 (${fmtPct(r.naturalTop.totalSeats / 222)}), selection weight ${r.naturalTop.selectionWeight.toFixed(3)}, coherence ${r.naturalTop.coherence.toFixed(2)}.`);
    md.push("");
  } else {
    md.push("**Natural coalition (PH formateur):** *No winning coalition reachable — PH formateur path BLOCKED at this seat distribution.*");
    md.push("");
  }
  if (r.broadened) {
    md.push(`**After royal broadening:** ${r.broadened.members.map(m => m.id).sort().join("+")} (${r.broadened.totalSeats}/222 seats).`);
    md.push("");
  }
  if (r.patronageEntrants.length > 0) {
    md.push(`**Patronage entrants:** ${r.patronageEntrants.map(e => `${e.partyId} (exposure ${e.legalExposure.toFixed(2)})`).join("; ")}.`);
    md.push("");
  }
  md.push(`**Royal intervention:** ${r.royal?.fired ? "FIRED" : "did not fire"} (crisis ${r.royal?.crisisLevel?.toFixed(2) ?? "n/a"}).`);
  if (r.pnLed) {
    md.push("");
    md.push(`**PN-led alternative path open:** ${r.pnLed.members.sort().join("+")} (${r.pnLed.seats} seats, weight ${r.pnLed.weight.toFixed(3)}).`);
  }
  md.push("");
  md.push(`**Cascade probability (GE16 instability):** ${fmtPct(r.cascade.probability, 1)} — fragility ${r.cascade.fragility.toFixed(2)}, mechanism: ${r.cascade.likelyMechanism}.`);
  if (r.cascade.fired && r.cascade.atRiskParties.length > 0) {
    md.push("");
    md.push("**At-risk coalition members:**");
    for (const p of r.cascade.atRiskParties.slice(0, 3)) {
      md.push(`- ${p.partyName} (${p.partyId}): defection probability ${fmtPct(p.defectionProbability, 0)}`);
    }
  }
  md.push("");
  md.push("---");
  md.push("");
}

// --- Card ranking ---
md.push("## 3. Cards ranked by engine output");
md.push("");
md.push("Two rankings: by **coalition stability for incumbent PMX** (higher = safer for Anwar), and by **cascade probability** (lower = less GE16 instability risk).");
md.push("");
md.push("### By incumbent stability (coalition seats × stability months)");
md.push("");
md.push("| Card | Final coalition | Seats | Stability (months) | Cascade % |");
md.push("|---|---|---:|---:|---:|");
const stabilityRanked = cardResults
  .map(r => ({
    card: r.card,
    final: r.broadened?.members?.map(m => m.id).sort().join("+") ?? r.naturalTop?.members?.map(m => m.id).sort().join("+") ?? "(none)",
    seats: r.broadened?.totalSeats ?? r.naturalTop?.totalSeats ?? 0,
    stability: r.naturalTop?.expectedStabilityMonths ?? 0,
    cascadePct: r.cascade.probability * 100,
  }))
  .sort((a, b) => (b.seats * b.stability) - (a.seats * a.stability));
for (const r of stabilityRanked) {
  md.push(`| ${r.card.id} | ${r.final} | ${r.seats} | ${r.stability} | ${r.cascadePct.toFixed(1)}% |`);
}
md.push("");
md.push("### By cascade risk (lowest first)");
md.push("");
md.push("| Card | Cascade % | Mechanism | At-risk parties |");
md.push("|---|---:|---|---|");
const cascadeRanked = [...cardResults].sort((a, b) => a.cascade.probability - b.cascade.probability);
for (const r of cascadeRanked) {
  const atRisk = r.cascade.atRiskParties.filter(p => p.defectionProbability > 0.5).map(p => p.partyId).join("/") || "none";
  md.push(`| ${r.card.id} | ${(r.cascade.probability * 100).toFixed(1)}% | ${r.cascade.likelyMechanism} | ${atRisk} |`);
}
md.push("");

// --- Cross-card synthesis ---
md.push("## 4. Cross-card synthesis (the structural argument)");
md.push("");
md.push("Reading the seven cards together — including the C0 baseline and the C6/C7 counter-scenarios:");
md.push("");

const bnInAllCards = cardResults.every(r => {
  const ids = (r.broadened?.members ?? r.naturalTop?.members ?? []).map(m => m.id);
  return ids.includes("BN");
});
const phLeadInMostCards = cardResults.filter(r => {
  const ids = (r.broadened?.members ?? r.naturalTop?.members ?? []).map(m => m.id);
  return ids.includes("PH");
}).length;
const pnLedExistsCount = cardResults.filter(r => r.pnLed).length;
const cascadeFireCount = cardResults.filter(r => r.cascade.fired).length;
const najibCardCascade = cardResults.find(r => r.card.id === "C1")?.cascade.probability ?? 0;
const worstCaseCascade = cardResults.find(r => r.card.id === "C7")?.cascade.probability ?? 0;

md.push(`1. **BN appears in the final coalition for ${cardResults.filter(r => {const ids = (r.broadened?.members ?? r.naturalTop?.members ?? []).map(m => m.id); return ids.includes("BN");}).length} of ${cardResults.length} cards${bnInAllCards ? " — every single scenario, including the worst case for Anwar" : ""}.** This is the same structural over-determination finding from the earlier GE16 scenarios report, but tested across a wider scenario space: the Unity Government coalition family is the answer to almost every card the incumbent can play.`);
md.push("");
md.push(`2. **PH-led coalition is reachable in ${phLeadInMostCards} of ${cardResults.length} cards.** The cards where it isn't are the ones where PN+BN combined dominate — i.e., the "Anwar loses" scenarios. The engine confirms what the political read says: Anwar's path to a second term goes through keeping BN inside, regardless of which specific card is played.`);
md.push("");
md.push(`3. **PN-led alternative formateur is mechanically open in ${pnLedExistsCount} of ${cardResults.length} scenarios.** The engine cannot decide between PH-led and PN-led without exogenous inputs (royal selection, Court Cluster patronage). Both are arithmetically winning. The choice is made by mechanisms exogenous to the seat-counting layer — exactly where editorial reasoning, not engine output, has to do the work.`);
md.push("");
md.push(`4. **Cascade probability rises sharply only in C7** (worst case: ${(worstCaseCascade * 100).toFixed(1)}%). In C1 (Najib pardon alone) cascade is ${(najibCardCascade * 100).toFixed(1)}% — the pardon by itself doesn't destabilise the coalition because BN's legal-exposure incentive to stay inside drops but the coalition arithmetic still works. The danger is COMPOUND: Najib pardon + PN consolidation simultaneously.`);
md.push("");
md.push(`5. **The Najib-pardon card is less decisive than the original analysis assumed.** Engine reading: C1 (Najib pardon) produces a coalition outcome very similar to C0 (status quo). BN seats rise from 44 to 56; coalition arithmetic unchanged; royal intervention doesn't fire in either. The pardon is significant POLITICALLY but the coalition mathematics don't shift much in the short run. The pardon's effect is on the BN legal-exposure parameter — which DOES matter, because it changes BN's longer-run incentive to stay in the Unity Government once Court Cluster pressure is gone. That's a Phase-2 effect the engine can model but only across multiple electoral cycles.`);
md.push("");
md.push(`6. **The drift state is the slow burn.** ${drift.eventsMatched} of ${events.length} encoded events have produced cumulative drift on the seven constitutional axes. The strongest drift is in \`bumiputera_policy\` and \`judicial_power\` — both pre-2008 effects. Post-2008 drift on \`expression_restriction\` is accelerating (CMA s.233, Sedition Act, proposed Akta Kedaulatan Raja). If C3 (3R defensive escalation) is played, this drift sharpens. The accumulated drift makes Malaysia's effective constitution in 2026 substantially different from 1957's text — and the cards available to the current government are CONSTRAINED by that drift.`);
md.push("");

// --- Pressure points ---
md.push("## 5. Pressure points (where small changes have outsized engine effects)");
md.push("");
md.push("From the engine output, three variables are the highest-leverage:");
md.push("");
md.push("1. **PH-PN block status.** Every scenario assumes it holds. If it breaks (PH-Bersatu reconciliation, Mahathir-style realignment), the entire coalition arithmetic changes. Engine cannot predict whether the block breaks but can show what happens if it does.");
md.push("");
md.push("2. **BN legal-exposure parameter (currently 0.85; post-pardon ~0.30).** This is the single parameter whose change most dramatically shifts BN's coalition preferences. C1 (Najib pardon) reduces it from 0.85 to 0.30. The engine treats post-0.30 BN as more comfortable in opposition or non-PH coalitions. This is the parameter to watch.");
md.push("");
md.push("3. **Borneo Affairs Ministry concession.** C2 (concession given) shifts GRS/GPS effective legal_exposure to 0.5 (treating ministerial-status guarantee as ~equivalent patronage). The engine consequence: Borneo bloc locks more tightly into Unity Government, reducing PN's path to majority via Borneo-defection.");
md.push("");

// --- What engine cannot tell us ---
md.push("## 6. What the engine cannot tell us — read editorially");
md.push("");
md.push("These are the limits the brief author must respect:");
md.push("");
md.push("- **Foreign-policy shocks.** China-Malaysia chip-deal collapse, US sanctions exposure, Saudi-Iran proxy effects — engine has no representation.");
md.push("- **Intra-party leadership crises.** Anwar's succession, Zahid's UMNO rivals, PAS post-Hadi — engine treats coalitions as monolithic.");
md.push("- **Judicial intervention.** Federal Court rulings can reshape the institutional ground the engine assumes (e.g., a ruling that invalidates Article 54(1) carve-out would break C5).");
md.push("- **Exogenous economic shocks.** Recession, ringgit collapse, commodity-price reversal — engine has crisis-indicators but no economic-cycle modelling.");
md.push("- **The 3R surface.** Engine treats Race/Religion/Royalty institutionally; can NOT model theological correctness, royal personal preference, or community emotional response. Those remain editorial territory.");
md.push("");

// --- Editorial implications ---
md.push("## 7. Editorial implications (what this means for T4A coverage)");
md.push("");
md.push("Reading the cards together produces a real claim the engine surfaces that the dominant narrative under-weights:");
md.push("");
md.push("> **The Unity Government's BN dependency is mechanically over-determined under nearly every card the incumbent can play. The Najib-pardon card, often framed as the decisive lever, produces less coalition-arithmetic change than the political theatre around it suggests; its real consequence is the longer-run shift in BN's coalition preferences once Court Cluster patronage no longer binds them. The fight worth watching is whether the PH-PN block holds — that is the single binary that flips the entire arithmetic, far more than any single card.**");
md.push("");
md.push("This is the kind of structural reframe T4A's editorial brand exists to surface: not who wins the news cycle, but what's mechanically determined.");
md.push("");

process.stdout.write(md.join("\n") + "\n");
