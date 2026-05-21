#!/usr/bin/env node
/**
 * Generate ULIDs for the simulation engine's seed records.
 *
 * Usage:
 *   node scripts/sim-gen-ulid.mjs           # print one ULID
 *   node scripts/sim-gen-ulid.mjs 20        # print 20 ULIDs
 *   node scripts/sim-gen-ulid.mjs --named foo bar baz   # named, tab-separated
 *
 * ULID format: 26 chars from Crockford's base32 alphabet, 48-bit timestamp + 80-bit random.
 * Matches the regex ^[0-9A-HJKMNP-TV-Z]{26}$ used by the schemas.
 */
import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function ulid() {
  let t = BigInt(Date.now());
  let time = "";
  for (let i = 0; i < 10; i++) {
    time = ALPHABET[Number(t % 32n)] + time;
    t /= 32n;
  }

  const bytes = randomBytes(10);
  let r = 0n;
  for (const b of bytes) r = (r << 8n) | BigInt(b);
  let rand = "";
  for (let i = 0; i < 16; i++) {
    rand = ALPHABET[Number(r % 32n)] + rand;
    r /= 32n;
  }
  return time + rand;
}

const args = process.argv.slice(2);
if (args[0] === "--named") {
  for (const name of args.slice(1)) {
    process.stdout.write(`${ulid()}\t${name}\n`);
  }
} else {
  const n = Number(args[0]) || 1;
  for (let i = 0; i < n; i++) process.stdout.write(`${ulid()}\n`);
}
