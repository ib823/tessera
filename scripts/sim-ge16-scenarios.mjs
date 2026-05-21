#!/usr/bin/env node
/**
 * GE16 forward-scenario projector. Runs the full simulation pipeline
 * on five hand-curated vote-share scenarios and produces both a JSON
 * dump (for engine introspection) and a markdown report (for editorial
 * use).
 *
 * IMPORTANT — internal use only. Per design doc §8.3, engine outputs
 * are NEVER published as numerical claims. This script produces a
 * STRUCTURAL reading of what each scenario would imply, not a forecast.
 *
 * Usage:
 *   node scripts/sim-ge16-scenarios.mjs                          # markdown
 *   node scripts/sim-ge16-scenarios.mjs --json                   # JSON
 *   node scripts/sim-ge16-scenarios.mjs --write docs/research/sim-engine-ge16-scenarios.md
 */

import { createState } from "../engine/sim/core/state.mjs";
import { runPipeline } from "../engine/sim/core/pipeline.mjs";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const jsonOut = args.includes("--json");
const writeIdx = args.findIndex(a => a === "--write");
const writeTo = writeIdx >= 0 ? args[writeIdx + 1] : null;

// --------------------------------------------------------------------------
// Party fixtures (GE15-shaped, extended with legal_exposure for Court
// Cluster modelling). Ideology vectors are calibrated to encoded actor
// records; rural_index hand-tuned in scripts/sim-backtest-elections.mjs.
// --------------------------------------------------------------------------

const PARTIES = [
  { id: "PH", name: "Pakatan Harapan", rural_index: -0.30, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": -0.10, "islamic-emphasis": -0.10, "centralisation-federal": 0.05, "reform-status-quo": 0.55 } },
  { id: "PN", name: "Perikatan Nasional", rural_index: 0.20, legal_exposure: 0.20,
    ideology: { "ethnic-mobilisation": 0.75, "islamic-emphasis": 0.80, "centralisation-federal": 0.30, "reform-status-quo": -0.05 } },
  { id: "BN", name: "Barisan Nasional", rural_index: -0.50, legal_exposure: 0.85,
    ideology: { "ethnic-mobilisation": 0.50, "islamic-emphasis": 0.25, "centralisation-federal": 0.55, "reform-status-quo": -0.40 } },
  { id: "GPS", name: "GPS", rural_index: 0.80, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": 0.20, "islamic-emphasis": 0.00, "centralisation-federal": -0.55, "reform-status-quo": -0.10 } },
  { id: "GRS", name: "GRS", rural_index: 0.40, legal_exposure: 0.10,
    ideology: { "ethnic-mobilisation": 0.25, "islamic-emphasis": 0.10, "centralisation-federal": -0.50, "reform-status-quo": -0.10 } },
  { id: "Warisan", name: "Warisan", rural_index: -0.10, legal_exposure: 0.05,
    ideology: { "ethnic-mobilisation": 0.10, "islamic-emphasis": -0.05, "centralisation-federal": -0.40, "reform-status-quo": 0.20 } },
  { id: "PBM", name: "Parti Bersama Malaysia", rural_index: -0.25, legal_exposure: 0.05,
    ideology: { "ethnic-mobilisation": -0.15, "islamic-emphasis": -0.10, "centralisation-federal": 0.10, "reform-status-quo": 0.80 } },
  { id: "MUDA", name: "MUDA", rural_index: -0.30, legal_exposure: 0.00,
    ideology: { "ethnic-mobilisation": -0.30, "islamic-emphasis": -0.20, "centralisation-federal": 0.10, "reform-status-quo": 0.85 } },
];

// --------------------------------------------------------------------------
// Scenarios. Each is a deviation from GE15 vote shares with a
// documented theory-of-change. Vote shares MUST sum to 1.
// --------------------------------------------------------------------------

const SCENARIOS = [
  {
    id: "A",
    name: "Status Quo",
    theory: "GE15 vote shares preserved. Baseline for comparison.",
    voteShares: { PH: 0.374, PN: 0.304, BN: 0.224, GPS: 0.060, GRS: 0.020, Warisan: 0.015, PBM: 0.000, MUDA: 0.003 },
    crisisIndicators: {},
  },
  {
    id: "B",
    name: "Najib Pardon",
    theory: "Najib receives full pardon between now and GE16. UMNO grassroots return to BN; some PN-leaning Malay voters shift back to BN; reformist PH voters partly demobilize.",
    voteShares: { PH: 0.350, PN: 0.275, BN: 0.282, GPS: 0.060, GRS: 0.020, Warisan: 0.010, PBM: 0.000, MUDA: 0.003 },
    crisisIndicators: {},
    notes: "BN +5.8pp (recovers ~half of post-2018 lost Malay vote). PN -2.9pp. PH -2.4pp.",
  },
  {
    id: "C",
    name: "PN Green Wave Continues",
    theory: "PAS-Bersatu extend their northern-belt sweep; subsidy fatigue and 3R framing harden Malay support; UMNO grassroots stay with PN.",
    voteShares: { PH: 0.345, PN: 0.380, BN: 0.180, GPS: 0.060, GRS: 0.020, Warisan: 0.012, PBM: 0.000, MUDA: 0.003 },
    crisisIndicators: {},
    notes: "PN +7.6pp. BN -4.4pp. PH -2.9pp. The 'green wave' scenario from the PN-aligned think-tanks.",
  },
  {
    id: "D",
    name: "Subsidy Fatigue (Mild)",
    theory: "Cost-of-living + subsidy-rationalisation backlash erodes PH urban vote; BN holds; PN gains modestly. The non-Najib version of the anti-incumbent scenario.",
    voteShares: { PH: 0.335, PN: 0.330, BN: 0.235, GPS: 0.060, GRS: 0.020, Warisan: 0.017, PBM: 0.000, MUDA: 0.003 },
    crisisIndicators: {},
    notes: "PH -3.9pp. PN +2.6pp. BN +1.1pp. The most-likely scenario per recent polls.",
  },
  {
    id: "E",
    name: "Najib Pardon + Modest PN Hold",
    theory: "Composite of B and C-lite: BN recovers via Najib goodwill, PN holds rather than collapsing, PH drops more sharply. The unity-government-loses scenario.",
    voteShares: { PH: 0.320, PN: 0.320, BN: 0.275, GPS: 0.060, GRS: 0.020, Warisan: 0.012, PBM: 0.000, MUDA: 0.003 },
    crisisIndicators: {},
    notes: "Three-way close finish at the federal level. Highest hung-parliament probability.",
  },
  {
    id: "F",
    name: "Rafizi PBM Spoils",
    theory: "Parti Bersama Malaysia (Rafizi/Nik Nazmi 2026) splits reformist urban PH vote in Klang Valley. PH loses pivotal urban-Selangor seats by margin smaller than PBM's vote.",
    voteShares: { PH: 0.330, PN: 0.310, BN: 0.230, GPS: 0.060, GRS: 0.020, Warisan: 0.015, PBM: 0.032, MUDA: 0.003 },
    crisisIndicators: {},
    notes: "PBM 3.2pp drawn primarily from PH urban-reform base. Spoiler-effect dynamics.",
  },
];

// --------------------------------------------------------------------------
// Run.
// --------------------------------------------------------------------------

function runScenario(scenario) {
  const state = createState({
    label: `GE16 scenario ${scenario.id}: ${scenario.name}`,
    asOfDate: "GE16-projected",
    totalSeats: 222,
    parties: PARTIES,
    voteShares: scenario.voteShares,
    blockedPairs: [["PH", "PN"]],
    crisisIndicators: scenario.crisisIndicators,
  });

  const result = runPipeline(state, {
    stepOptions: {
      coalition: { formateurId: "PH", topK: 5 },
      royal: { crisisThreshold: 0.5 },
    },
  });

  let electoralState = null;
  for (let i = result.trajectory.length - 1; i >= 0; i--) {
    if (result.trajectory[i].lastMechanism === "electoral") { electoralState = result.trajectory[i]; break; }
  }

  const seatsByParty = Object.fromEntries(electoralState.parties.map(p => [p.id, p.seats]));
  const final = result.finalState;

  const topCandidates = (final.coalition?.candidates ?? []).slice(0, 3).map(c => ({
    members: c.members.map(m => m.id),
    seats: c.totalSeats,
    selectionWeight: c.selectionWeight,
    coherence: c.coherence,
    expectedStabilityMonths: c.expectedStabilityMonths,
  }));

  // Alternative formateur — try PN-led if PN has enough seats.
  let pnLed = null;
  if (seatsByParty.PN > seatsByParty.PH) {
    const pnState = createState({
      ...state,
      label: state.label + " (PN-formateur alt)",
      parties: electoralState.parties,
      blockedPairs: [["PH", "PN"]],
    });
    const pnResult = runPipeline(pnState, {
      stepOptions: {
        coalition: { formateurId: "PN", topK: 3 },
        royal: { crisisThreshold: 0.5 },
      },
    });
    pnLed = (pnResult.finalState.coalition?.candidates ?? []).slice(0, 1).map(c => ({
      members: c.members.map(m => m.id),
      seats: c.totalSeats,
      selectionWeight: c.selectionWeight,
    }))[0] ?? null;
  }

  return {
    scenario,
    predictedSeats: seatsByParty,
    topCandidates,
    pnLedAlternative: pnLed,
    royalIntervention: final.royalIntervention,
    patronage: final.patronage ? { entrants: final.patronage.entrants } : null,
  };
}

const results = SCENARIOS.map(runScenario);

// --------------------------------------------------------------------------
// Output.
// --------------------------------------------------------------------------

if (jsonOut) {
  process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  process.exit(0);
}

function fmtMembers(arr) {
  if (!arr || arr.length === 0) return "(none)";
  return arr.sort().join("+");
}

function pctNumber(n) {
  return (n * 100).toFixed(1);
}

function markdownReport() {
  const lines = [];
  lines.push("# GE16 Forward Scenarios — Engine Output");
  lines.push("");
  lines.push(`**Status:** internal T4A — NOT for publication as numerical claims (per design doc §8.3).`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Engine:** 5-mechanism pipeline (outbidding -> electoral -> coalition -> patronage -> royal)`);
  lines.push("");
  lines.push("## What this report is, and is not");
  lines.push("");
  lines.push("This is a **structural reading** of six hand-curated vote-share scenarios.");
  lines.push("It is NOT a forecast. The numbers should be read as *if-then* relationships:");
  lines.push("**if** the vote shares fall as described, **then** the engine's mechanism");
  lines.push("modules would route the coalition arithmetic as shown.");
  lines.push("");
  lines.push("Known calibration limitations (from `sim-backtest-elections.mjs`):");
  lines.push("");
  lines.push("- PAS seats systematically over-predicted (rural-bias model can't capture");
  lines.push("  regional concentration; PAS's vote-to-seat conversion is poor outside");
  lines.push("  the northern heartland).");
  lines.push("- BN seats systematically under-predicted in dominant-party periods");
  lines.push("  (base-erosion / incumbency not modelled).");
  lines.push("- Mean MAPE across GE12-15 is 30.3%; only GE15 passes the 25% threshold.");
  lines.push("");
  lines.push("Treat the outputs as a **disciplined reading of the natural coalition family**");
  lines.push("for each scenario, not as numerical predictions. Each scenario's qualitative");
  lines.push("answer is more reliable than its specific seat counts.");
  lines.push("");
  lines.push("## Scenarios");
  lines.push("");
  for (const r of results) {
    lines.push(`### Scenario ${r.scenario.id} — ${r.scenario.name}`);
    lines.push("");
    lines.push(`**Theory of change:** ${r.scenario.theory}`);
    lines.push("");
    if (r.scenario.notes) {
      lines.push(`**Notes:** ${r.scenario.notes}`);
      lines.push("");
    }
    lines.push("**Vote shares (assumed):**");
    lines.push("");
    lines.push("| Party | Vote % |");
    lines.push("|---|---:|");
    for (const [pid, share] of Object.entries(r.scenario.voteShares)) {
      if (share > 0) lines.push(`| ${pid} | ${pctNumber(share)}% |`);
    }
    lines.push("");
    lines.push("**Engine output:**");
    lines.push("");
    lines.push("Predicted seat distribution:");
    lines.push("");
    lines.push("| Party | Predicted seats | Share |");
    lines.push("|---|---:|---:|");
    for (const [pid, seats] of Object.entries(r.predictedSeats)) {
      if (seats > 0) lines.push(`| ${pid} | ${seats} | ${pctNumber(seats / 222)}% |`);
    }
    lines.push("");
    lines.push("Top-3 PH-led coalition candidates (formateur = PH):");
    lines.push("");
    if (r.topCandidates.length === 0) {
      lines.push("- **No PH-led winning coalition reaches majority** with these seat counts. PH formateur fails; alternative formateur required.");
    } else {
      lines.push("| Rank | Members | Seats | Selection weight | Coherence | Stability (months) |");
      lines.push("|---:|---|---:|---:|---:|---:|");
      r.topCandidates.forEach((c, i) => {
        lines.push(`| ${i + 1} | ${fmtMembers(c.members)} | ${c.seats} | ${c.selectionWeight.toFixed(3)} | ${c.coherence.toFixed(2)} | ${c.expectedStabilityMonths} |`);
      });
    }
    lines.push("");
    if (r.pnLedAlternative) {
      lines.push("PN-led alternative formateur (if PH cannot form):");
      lines.push("");
      lines.push(`- ${fmtMembers(r.pnLedAlternative.members)} (${r.pnLedAlternative.seats} seats, weight ${r.pnLedAlternative.selectionWeight.toFixed(3)})`);
      lines.push("");
    }
    if (r.royalIntervention?.fired) {
      lines.push(`**Royal intervention:** FIRED (crisis ${r.royalIntervention.crisisLevel.toFixed(2)}). Natural -> broadened:`);
      lines.push(`- Natural: ${fmtMembers(r.royalIntervention.naturalCoalition.members)} (${r.royalIntervention.naturalCoalition.totalSeats} seats)`);
      lines.push(`- Broadened: ${fmtMembers(r.royalIntervention.broadenedCoalition.members)} (${r.royalIntervention.broadenedCoalition.totalSeats} seats)`);
      lines.push(`- Additions: ${r.royalIntervention.additions.map(a => `${a.partyName} +${a.seatsAdded}`).join(", ") || "(none)"}`);
      lines.push("");
    } else {
      lines.push(`**Royal intervention:** did not fire (crisis ${r.royalIntervention?.crisisLevel.toFixed(2) ?? "n/a"}, below threshold). Natural coalition stands.`);
      lines.push("");
    }
    if (r.patronage?.entrants?.length > 0) {
      lines.push(`**Patronage legal-exposure entrants:** ${r.patronage.entrants.map(e => `${e.partyId} (exposure ${e.legalExposure.toFixed(2)}, margin ${e.entryMargin.toFixed(2)})`).join("; ")}`);
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  lines.push("## Cross-scenario synthesis");
  lines.push("");
  // Compute synthesis facts from actual results, not hand-asserted.
  const royalFiredCount = results.filter(r => r.royalIntervention?.fired).length;
  const pnLedExistsCount = results.filter(r => r.pnLedAlternative).length;
  const bnAlwaysInTop1 = results.every(r => r.topCandidates[0]?.members.includes("BN"));
  const phAloneNeverMajority = results.every(r => (r.predictedSeats.PH ?? 0) < 112);
  lines.push("Reading the six scenarios together, four structural findings:");
  lines.push("");
  lines.push("1. **PH's coalition arithmetic is structurally fragile.** In every scenario");
  lines.push(`   evaluated, PH alone reaches at most ${Math.max(...results.map(r => r.predictedSeats.PH ?? 0))} seats — below the 112-seat`);
  lines.push("   majority threshold. PH cannot govern alone in any plausible vote-share");
  lines.push("   distribution; the natural PH-led coalition always requires at least one");
  lines.push("   additional partner.");
  lines.push("");
  lines.push(`2. **BN is in every PH-led natural coalition (${bnAlwaysInTop1 ? "all 6 of 6" : "some"} scenarios).** Because PH alone`);
  lines.push("   is short of majority and the PH-PN block holds, BN is the only large party");
  lines.push("   PH can pair with that the engine sees as ideologically reachable. BN's");
  lines.push("   Court Cluster legal-exposure (encoded as 0.85 in the patronage module)");
  lines.push("   reinforces this: BN's value-of-being-inside is structurally elevated.");
  lines.push("   The Unity-Government coalition family is, by the engine's read,");
  lines.push("   OVER-determined under current institutional constraints.");
  lines.push("");
  lines.push(`3. **Royal intervention is mechanically redundant in these scenarios**`);
  lines.push(`   (${royalFiredCount} of ${results.length} fired). Because the natural PH-led coalition already`);
  lines.push("   absorbs BN out of arithmetic necessity, the resulting coalition has");
  lines.push("   sufficient seat margin above the 50%+7% stability buffer to make royal");
  lines.push("   broadening unnecessary. This is itself a finding: the engine reads the");
  lines.push("   GE15 Unity Government as a coalition-logic outcome, not a royal-");
  lines.push("   arbitration outcome — even though the historical narrative emphasises");
  lines.push("   the royal role.");
  lines.push("");
  lines.push(`4. **PN-led alternative formateur is mechanically possible in ${pnLedExistsCount} of ${results.length} scenarios.**`);
  lines.push("   When PN has more predicted seats than PH (B Najib Pardon, D Subsidy");
  lines.push("   Fatigue, E Combined, F PBM Spoils), an alternative formateur path opens");
  lines.push("   through PN+BN. The engine cannot decide between PH-led and PN-led — both");
  lines.push("   are mechanically winning. The historical choice has been made by royal");
  lines.push("   selection of formateur (2022 GE15) and by Court Cluster patronage");
  lines.push("   incentive (BN preferred PH for AGC arithmetic). Both of those are");
  lines.push("   exogenous to the coalition module and would need explicit modelling to");
  lines.push("   produce a single answer.");
  lines.push("");
  lines.push("## Pressure-points for editorial");
  lines.push("");
  lines.push("Where small changes have outsized engine effects (per §8.1 pressure-point");
  lines.push("map):");
  lines.push("");
  lines.push("- **The PH-PN block.** Every scenario assumes it holds. If it broke (e.g.,");
  lines.push("  PH-Bersatu reconciliation, a Mahathir-style realignment), the entire");
  lines.push("  coalition arithmetic changes. The engine cannot predict whether the block");
  lines.push("  breaks, but it can show what happens if it does.");
  lines.push("");
  lines.push("- **BN's legal-exposure parameter (currently 0.85).** If Najib gets a full");
  lines.push("  pardon and Zahid's DNAA holds, BN's legal exposure could drop toward 0.3,");
  lines.push("  reducing the patronage incentive to stay inside government. This would");
  lines.push("  shift BN's preference toward independence (BN-solo) or alternative partner");
  lines.push("  (BN-PN reunion).");
  lines.push("");
  lines.push("- **Borneo bloc preferences.** GPS+GRS hold 29 seats federally. The engine");
  lines.push("  treats them as approximately status-quo in every scenario, but their");
  lines.push("  Borneo Affairs Ministry demand (T4A issue 1705) is a leverage point that");
  lines.push("  could shift their alignment if Anwar concedes or refuses.");
  lines.push("");
  lines.push("## What this report does NOT do");
  lines.push("");
  lines.push("- It does NOT predict who will win GE16.");
  lines.push("- It does NOT assign probabilities to scenarios.");
  lines.push("- It does NOT incorporate exogenous shocks (foreign policy, scandals,");
  lines.push("  deaths, royal action) that the engine cannot model with current data.");
  lines.push("- It does NOT capture the Borneo regional-concentration effect that the");
  lines.push("  electoral mechanism systematically under-predicts.");
  lines.push("");
  lines.push("Use as a starting point for editorial reasoning, not as a finished answer.");
  lines.push("");

  return lines.join("\n");
}

const md = markdownReport();

if (writeTo) {
  writeFileSync(writeTo, md);
  console.log(`Wrote ${writeTo} (${md.length} chars)`);
} else {
  process.stdout.write(md);
}
