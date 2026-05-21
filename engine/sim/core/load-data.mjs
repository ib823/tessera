/**
 * Load encoded data from engine/sim/data/ into in-memory maps.
 *
 * Returns:
 *   { actors, events, institutions, cleavages }
 * where each is a Map<ULID, record>.
 *
 * This is the minimal core layer needed to feed mechanism modules in
 * Phase 4. The full State vector (P, R, C, D, L, ρ) per the design
 * doc §4.1 is built on top of this in Phase 5.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DATA = new URL("../data/", import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === "staging") continue;
      out.push(...walk(full));
    } else if (entry.endsWith(".json")) {
      out.push(full);
    }
  }
  return out;
}

function loadDir(subdir) {
  const map = new Map();
  for (const f of walk(join(DATA, subdir))) {
    const obj = JSON.parse(readFileSync(f, "utf8"));
    map.set(obj.id, obj);
  }
  return map;
}

export function loadAll() {
  return {
    actors: loadDir("actors"),
    events: loadDir("events"),
    institutions: loadDir("institutions"),
    cleavages: loadDir("cleavages"),
  };
}

/**
 * Return the most recent role for an actor as of `asOfDate` (ISO yyyy-mm-dd
 * or partial). Useful for "who is the PM right now" queries.
 */
export function currentRole(actor, office, asOfDate) {
  if (!actor.role_history) return null;
  const dateOf = (s) => s ? s.padEnd(10, "-99") : "9999-99-99";
  const cutoff = dateOf(asOfDate);
  const matches = actor.role_history.filter(r => {
    if (r.office !== office) return false;
    const from = dateOf(r.from);
    const to = r.to ? dateOf(r.to) : "9999-99-99";
    return from <= cutoff && cutoff <= to;
  });
  return matches.length ? matches[matches.length - 1] : null;
}

/**
 * Get the canonical name of an actor by id (or "?" if not found).
 */
export function nameOf(actors, id) {
  return actors.get(id)?.canonical_name || "?";
}
