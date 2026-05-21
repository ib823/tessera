#!/usr/bin/env node
/**
 * Minimal structural validator for simulation-engine seed data.
 *
 * Full JSON-Schema validation is deferred to Phase 6 (when ajv or
 * equivalent is added as a dev dependency). This script checks the
 * essentials that catch typical encoding errors:
 *
 * - All data files parse as JSON.
 * - Every record carries an `id` matching the ULID regex.
 * - The id in the file matches the filename basename.
 * - Type/class enums match the schemas.
 * - Every cross-reference (ActorRef, EventRef, InstitutionRef, CleavageRef)
 *   either resolves to an existing record or is flagged.
 * - Required common fields exist per record kind.
 *
 * Usage:
 *   node scripts/sim-data-check.mjs                 # check, print summary
 *   node scripts/sim-data-check.mjs --verbose       # print each file
 *   node scripts/sim-data-check.mjs --strict        # exit 1 on warnings too
 *
 * Exits 0 on success, 1 on errors.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("../engine/sim/data/", import.meta.url).pathname;
const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;

const ACTOR_CLASS = new Set(["individual", "collective", "institutional"]);
const EVENT_TYPE = new Set([
  "Election", "LegislativeVote", "ConstitutionalAmendment",
  "RoyalIntervention", "CoupOrAttempt", "Protest", "TrialVerdict",
  "PolicyAnnouncement", "ScandalRevelation", "ResourceTransfer",
  "DiscursiveEvent", "DemographicShift", "ElitePersonnelChange",
  "InstitutionalCreation", "CoalitionFormation", "ExogenousShock",
]);
const PERIOD = new Set(["P1", "P2", "P3", "P4", "P5", "P6", "P7"]);
const CONFIDENCE = new Set(["HIGH", "MED", "LOW"]);

const args = new Set(process.argv.slice(2));
const verbose = args.has("--verbose");
const strict = args.has("--strict");

const errors = [];
const warnings = [];
const records = new Map(); // id -> { kind, file }

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".json")) out.push(full);
  }
  return out;
}

function err(file, msg) { errors.push(`ERROR ${file}: ${msg}`); }
function warn(file, msg) { warnings.push(`WARN  ${file}: ${msg}`); }

function checkULIDRefs(file, obj, fieldName) {
  const refs = [];
  function walkObj(o) {
    if (Array.isArray(o)) { for (const v of o) walkObj(v); return; }
    if (o && typeof o === "object") {
      for (const [k, v] of Object.entries(o)) {
        if (
          (k.endsWith("_id") || k.endsWith("_actor") || k.endsWith("_actors") ||
           k === "member_ids" || k === "related_events" || k === "actors_involved" ||
           k === "cleavage_id" || k === "institution_affected" || k === "other_id" ||
           k === "intervener_actor" || k === "target_actor" || k === "defendant_actor" ||
           k === "subject_actor" || k === "revealer_actor" || k === "decider_actor" ||
           k === "from_actor" || k === "to_actor" || k === "beneficial_owner_actor" ||
           k === "speaker_actor" || k === "announcing_actor" || k === "affected_actor" ||
           k === "coalition_actor" || k === "formateur_actor" || k === "decided_by_actor" ||
           k === "appointed_by" || k === "ended_by_event" || k === "shaping_event" ||
           k === "shaping_institution" || k === "source_event")
          && typeof v === "string"
        ) refs.push({ key: k, value: v });
        if (Array.isArray(v) && (k === "member_ids" || k === "related_events" ||
             k === "actors_involved" || k === "attempting_actors" || k === "organising_actors" ||
             k === "member_actors")) {
          for (const item of v) {
            if (typeof item === "string") refs.push({ key: k, value: item });
          }
        }
        walkObj(v);
      }
    }
  }
  walkObj(obj);
  return refs;
}

function checkActor(file, obj) {
  if (!obj.id || !ULID_RE.test(obj.id)) err(file, "missing or malformed id");
  if (basename(file, ".json") !== obj.id) err(file, `filename does not match id (${obj.id})`);
  if (!ACTOR_CLASS.has(obj.actor_class)) err(file, `unknown actor_class: ${obj.actor_class}`);
  if (!obj.canonical_name) err(file, "missing canonical_name");
  if (!Array.isArray(obj.primary_sources) || obj.primary_sources.length === 0)
    err(file, "missing primary_sources (≥1 required)");
  if (obj.actor_class === "institutional" && !obj.institution_id)
    err(file, "institutional actor missing institution_id");
  records.set(obj.id, { kind: "actor", file });
}

function checkEvent(file, obj) {
  if (!obj.id || !ULID_RE.test(obj.id)) err(file, "missing or malformed id");
  if (basename(file, ".json") !== obj.id) err(file, `filename does not match id (${obj.id})`);
  if (!EVENT_TYPE.has(obj.type)) err(file, `unknown event type: ${obj.type}`);
  if (!obj.date_start) err(file, "missing date_start");
  if (!PERIOD.has(obj.period)) err(file, `unknown period: ${obj.period}`);
  if (!CONFIDENCE.has(obj.confidence)) err(file, `unknown confidence: ${obj.confidence}`);
  if (!Array.isArray(obj.primary_sources) || obj.primary_sources.length === 0)
    err(file, "missing primary_sources (≥1 required)");
  records.set(obj.id, { kind: "event", file });
}

function checkInstitution(file, obj) {
  if (!obj.id || !ULID_RE.test(obj.id)) err(file, "missing or malformed id");
  if (basename(file, ".json") !== obj.id) err(file, `filename does not match id (${obj.id})`);
  if (!obj.canonical_name) err(file, "missing canonical_name");
  if (!Array.isArray(obj.rule_set) || obj.rule_set.length === 0)
    err(file, "missing rule_set (≥1 required)");
  if (!Array.isArray(obj.primary_sources) || obj.primary_sources.length === 0)
    err(file, "missing primary_sources (≥1 required)");
  records.set(obj.id, { kind: "institution", file });
}

function checkCleavage(file, obj) {
  if (!obj.id || !ULID_RE.test(obj.id)) err(file, "missing or malformed id");
  if (basename(file, ".json") !== obj.id) err(file, `filename does not match id (${obj.id})`);
  if (!obj.canonical_name) err(file, "missing canonical_name");
  if (obj.axis !== "ordinal" && obj.axis !== "categorical")
    err(file, `unknown axis: ${obj.axis}`);
  if (!Array.isArray(obj.institutional_history) || obj.institutional_history.length === 0)
    err(file, "missing institutional_history (≥1 required per §9.2 no-essentialism rule)");
  if (!Array.isArray(obj.primary_sources) || obj.primary_sources.length === 0)
    err(file, "missing primary_sources (≥1 required)");
  records.set(obj.id, { kind: "cleavage", file });
}

// Walk all data files
const files = walk(ROOT);
const allRefs = [];

for (const file of files) {
  let obj;
  try {
    obj = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    err(file, `JSON parse error: ${e.message}`);
    continue;
  }
  const rel = file.replace(ROOT, "");
  if (rel.startsWith("actors/")) checkActor(file, obj);
  else if (rel.startsWith("events/")) checkEvent(file, obj);
  else if (rel.startsWith("institutions/")) checkInstitution(file, obj);
  else if (rel.startsWith("cleavages/")) checkCleavage(file, obj);
  else warn(file, "file not under a known subdirectory");

  // Collect cross-references
  for (const ref of checkULIDRefs(file, obj)) {
    allRefs.push({ file, ...ref });
  }
  if (verbose) console.log(`  ${rel}: ${obj.canonical_name || obj.type || "?"}`);
}

// Resolve cross-references
for (const { file, key, value } of allRefs) {
  if (!ULID_RE.test(value)) {
    err(file, `field ${key} contains non-ULID value: ${value}`);
    continue;
  }
  if (!records.has(value)) {
    warn(file, `field ${key} references ${value} which is not yet encoded`);
  }
}

// Summary
console.log("");
console.log(`Files checked:  ${files.length}`);
console.log(`Actors:         ${[...records.values()].filter(r => r.kind === "actor").length}`);
console.log(`Events:         ${[...records.values()].filter(r => r.kind === "event").length}`);
console.log(`Institutions:   ${[...records.values()].filter(r => r.kind === "institution").length}`);
console.log(`Cleavages:      ${[...records.values()].filter(r => r.kind === "cleavage").length}`);
console.log(`Cross-refs:     ${allRefs.length}`);
console.log(`Errors:         ${errors.length}`);
console.log(`Warnings:       ${warnings.length}`);
console.log("");

for (const e of errors) console.log(e);
for (const w of warnings) console.log(w);

if (errors.length > 0) process.exit(1);
if (strict && warnings.length > 0) process.exit(1);
process.exit(0);
