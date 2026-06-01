#!/usr/bin/env node
/**
 * The Plumb Line — C1 pivotality (Shapley-Shubik) computation
 * ----------------------------------------------------------------
 * Reproducible, auditable computation of the Shapley-Shubik power index from
 * ACTUAL public seat counts (methodology dimension C1). Run it to regenerate
 * the C1 values recorded in src/data/leaders/*.json; the leader files cite
 * both the seat-count source and this script so the number is checkable.
 *
 * Frame: coalitions are the players in the 222-seat Dewan Rakyat, simple
 * majority quota 112. Coalition-level (not party-level) because coalition
 * seat totals are unambiguous in the public record, whereas per-party tallies
 * carry a 1-2 seat contradiction; ±1 seat is immaterial to the index here.
 *
 * Seat source: Election Commission GE15 result as it stood for the unity
 * government's tenure (post Padang Serai by-election, 7 Dec 2022: PH 82).
 * Contradiction noted: PH was 81 on polling night (Padang Serai postponed),
 * 82 after the by-election. We use 82, the figure that held during the scored
 * period. Small blocs (MUDA, KDM, PBM, independents) are lumped as "Others".
 */

// Coalition weights (seats). Sum = 222.
const BLOCS = {
  PH: 82,
  PN: 74,
  BN: 30,
  GPS: 23,
  GRS: 6,
  Warisan: 3,
  Others: 4,
};
const QUOTA = 112; // simple majority of 222

function factorial(n) {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

/** Shapley-Shubik power index for each player in a weighted majority game. */
function shapleyShubik(weights, quota) {
  const names = Object.keys(weights);
  const n = names.length;
  const w = names.map((k) => weights[k]);
  const power = new Array(n).fill(0);
  const nFact = factorial(n);

  for (let i = 0; i < n; i++) {
    // Sum over all subsets S of the other players where i is the pivot:
    // w(S) < quota <= w(S) + w_i.
    const others = [...Array(n).keys()].filter((j) => j !== i);
    const m = others.length;
    for (let mask = 0; mask < 1 << m; mask++) {
      let sw = 0;
      let size = 0;
      for (let b = 0; b < m; b++) {
        if (mask & (1 << b)) {
          sw += w[others[b]];
          size++;
        }
      }
      if (sw < quota && sw + w[i] >= quota) {
        power[i] += (factorial(size) * factorial(n - size - 1)) / nFact;
      }
    }
  }
  return Object.fromEntries(names.map((k, idx) => [k, power[idx]]));
}

const ss = shapleyShubik(BLOCS, QUOTA);
const total = Object.values(ss).reduce((a, b) => a + b, 0);

console.log('Shapley-Shubik power index — Dewan Rakyat (GE15, quota 112/222)\n');
for (const [k, v] of Object.entries(ss).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(9)} seats=${String(BLOCS[k]).padStart(3)}  SS=${v.toFixed(4)}`);
}
console.log(`\n  (sum = ${total.toFixed(4)})`);
