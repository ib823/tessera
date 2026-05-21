/**
 * Coalition-formation mechanism module.
 *
 * Implements a tractable Laver-Shepsle + Riker + Gamson approach:
 *
 *   1. Enumerate winning coalitions: subsets of parties whose combined
 *      seat share exceeds the formation threshold (default 0.5).
 *   2. Filter out coalitions containing blocked pairs (e.g., DAP-PAS).
 *   3. Score each winning coalition on four components:
 *        - ideological coherence  (Reber-Schwarz processing fluency proxy
 *          via mean pairwise Euclidean distance in ideology space)
 *        - minimum-winning preference (Riker 1962: smaller surplus better)
 *        - connectedness (Axelrod 1970: parties adjacent on dominant axis)
 *        - formateur compatibility (largest party's distance to centroid)
 *   4. Sample top-K coalitions weighted by score (softmax with temperature).
 *   5. For each sampled coalition, allocate portfolios by Gamson's law
 *      (proportional to seat contribution).
 *   6. Estimate stability and expected duration from coherence + excess.
 *
 * The mechanism is BOUNDED-RATIONALITY, not full game-theoretic. It
 * returns a distribution over plausible coalitions, not a unique
 * equilibrium. See design doc §4.4, §5.1.
 *
 * Input shape:
 *   parties: [
 *     {
 *       id: string,
 *       name: string,
 *       seats: integer,
 *       ideology: { [axis]: number in [-1, 1] },
 *     }
 *   ]
 *   options: {
 *     totalSeats?: integer (default = sum of party seats),
 *     threshold?: number in (0, 1) (default 0.5),
 *     blockedPairs?: [[id, id], ...],
 *     formateurId?: string (overrides "largest party"),
 *     topK?: integer (default 5),
 *     temperature?: number (default 0.5; smaller = more deterministic),
 *     weights?: {  // scoring weights, must be non-negative
 *       coherence?: number (default 0.40),
 *       minWinning?: number (default 0.25),
 *       connectedness?: number (default 0.20),
 *       formateurFit?: number (default 0.15),
 *     },
 *     dominantAxis?: string (defaults to highest-variance axis),
 *   }
 *
 * Output shape:
 *   {
 *     formateur: { id, name, seats },
 *     winningCoalitions: integer,  // count after filtering
 *     candidates: [
 *       {
 *         members: [{ id, name, seats, share }],
 *         totalSeats: integer,
 *         excessOverThreshold: integer,
 *         coherence: number in [0, 1],
 *         scoreComponents: { coherence, minWinning, connectedness, formateurFit },
 *         compositeScore: number in [0, 1],
 *         selectionWeight: number in [0, 1],  // softmax
 *         portfolioAllocation: { [id]: number in [0, 1] },  // sums to 1
 *         expectedStabilityMonths: integer,
 *       }
 *     ],
 *   }
 */

const DEFAULT_WEIGHTS = {
  coherence: 0.40,
  minWinning: 0.25,
  connectedness: 0.20,
  formateurFit: 0.15,
};

function combinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k),
  ];
}

function allSubsets(arr) {
  const out = [[]];
  for (const x of arr) {
    const len = out.length;
    for (let i = 0; i < len; i++) out.push([...out[i], x]);
  }
  return out;
}

function pairwiseDistance(p1, p2, axes) {
  let sum = 0;
  for (const axis of axes) {
    const a = p1.ideology?.[axis] ?? 0;
    const b = p2.ideology?.[axis] ?? 0;
    sum += (a - b) ** 2;
  }
  return Math.sqrt(sum);
}

function centroid(parties, axes) {
  const c = {};
  for (const axis of axes) {
    let weight = 0, sum = 0;
    for (const p of parties) {
      const v = p.ideology?.[axis] ?? 0;
      sum += v * p.seats;
      weight += p.seats;
    }
    c[axis] = weight > 0 ? sum / weight : 0;
  }
  return c;
}

function findDominantAxis(parties, axes) {
  let best = axes[0], bestVar = -Infinity;
  for (const axis of axes) {
    const vals = parties.map(p => p.ideology?.[axis] ?? 0);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
    if (variance > bestVar) { best = axis; bestVar = variance; }
  }
  return best;
}

function isBlocked(coalition, blockedPairs) {
  const ids = new Set(coalition.map(p => p.id));
  for (const [a, b] of blockedPairs) {
    if (ids.has(a) && ids.has(b)) return true;
  }
  return false;
}

function softmax(values, temperature) {
  const T = Math.max(temperature, 1e-6);
  const max = Math.max(...values);
  const exp = values.map(v => Math.exp((v - max) / T));
  const sum = exp.reduce((s, e) => s + e, 0);
  return exp.map(e => e / sum);
}

/**
 * Score components, each normalised to [0, 1] where 1 is best.
 */
function scoreComponents(coalition, allParties, threshold, totalSeats, dominantAxis, axes, formateurId) {
  const totalCoalitionSeats = coalition.reduce((s, p) => s + p.seats, 0);
  const requiredSeats = totalSeats * threshold;

  // 1. Coherence — mean pairwise distance, inverted and normalised.
  let pairs = 0, sumDist = 0;
  for (let i = 0; i < coalition.length; i++) {
    for (let j = i + 1; j < coalition.length; j++) {
      sumDist += pairwiseDistance(coalition[i], coalition[j], axes);
      pairs++;
    }
  }
  const meanDist = pairs > 0 ? sumDist / pairs : 0;
  const maxDist = 2 * Math.sqrt(axes.length); // [-1, 1] per axis
  const coherence = 1 - meanDist / maxDist;

  // 2. Minimum-winning — penalise surplus over threshold.
  const excess = totalCoalitionSeats - requiredSeats;
  const maxPossibleExcess = totalSeats - requiredSeats;
  const minWinning = maxPossibleExcess > 0
    ? 1 - Math.max(0, excess) / maxPossibleExcess
    : 0;

  // 3. Connectedness — variance on dominant axis (low variance = adjacent).
  const dominantVals = coalition.map(p => p.ideology?.[dominantAxis] ?? 0);
  const dominantMean = dominantVals.reduce((s, v) => s + v, 0) / dominantVals.length;
  const dominantVar = dominantVals.reduce((s, v) => s + (v - dominantMean) ** 2, 0) / dominantVals.length;
  const connectedness = 1 - Math.min(1, dominantVar / 0.5);

  // 4. Formateur fit — formateur's distance from coalition centroid.
  const formateur = formateurId
    ? coalition.find(p => p.id === formateurId)
    : coalition.reduce((a, b) => a.seats > b.seats ? a : b);
  const c = centroid(coalition, axes);
  let formateurDist = 0;
  for (const axis of axes) {
    const v = formateur?.ideology?.[axis] ?? 0;
    formateurDist += (v - c[axis]) ** 2;
  }
  formateurDist = Math.sqrt(formateurDist);
  const formateurFit = 1 - formateurDist / maxDist;

  return { coherence, minWinning, connectedness, formateurFit };
}

function expectedStabilityMonths(coherence, excess, totalSeats) {
  // Empirical anchor: a 5-party 53% coalition with low coherence lasts
  // ~18 months (Sheraton-era PN average); a tight 2-party 60%+ coalition
  // with high coherence lasts close to full term (~60 months).
  const baseline = 24;
  const coherenceBonus = coherence * 36;
  const excessBonus = Math.max(0, excess / totalSeats) * 20;
  return Math.round(baseline + coherenceBonus + excessBonus);
}

function gamsonPortfolios(coalition) {
  const total = coalition.reduce((s, p) => s + p.seats, 0);
  const out = {};
  for (const p of coalition) out[p.id] = p.seats / total;
  return out;
}

/**
 * Main entry point.
 */
export function formCoalition(parties, options = {}) {
  const totalSeats = options.totalSeats ?? parties.reduce((s, p) => s + p.seats, 0);
  const threshold = options.threshold ?? 0.5;
  const blockedPairs = options.blockedPairs ?? [];
  const topK = options.topK ?? 5;
  const temperature = options.temperature ?? 0.5;
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights ?? {}) };

  const axes = [...new Set(parties.flatMap(p => Object.keys(p.ideology ?? {})))];
  const dominantAxis = options.dominantAxis ?? findDominantAxis(parties, axes);

  // Enumerate winning coalitions. For >20 parties switch to a heuristic;
  // realistic Malaysian inputs are 5-12 parties.
  let subsets;
  if (parties.length > 20) {
    // Greedy expansion from largest party.
    const sorted = [...parties].sort((a, b) => b.seats - a.seats);
    subsets = [];
    for (let i = 0; i < sorted.length; i++) {
      subsets.push([sorted[i]]);
      for (let j = i + 1; j < sorted.length; j++) {
        subsets.push([sorted[i], sorted[j]]);
        for (let k = j + 1; k < sorted.length; k++) {
          subsets.push([sorted[i], sorted[j], sorted[k]]);
        }
      }
    }
  } else {
    subsets = allSubsets(parties);
  }

  const required = totalSeats * threshold;
  const winning = subsets.filter(s => {
    if (s.length === 0) return false;
    const sum = s.reduce((acc, p) => acc + p.seats, 0);
    return sum > required && !isBlocked(s, blockedPairs);
  });

  const formateur = options.formateurId
    ? parties.find(p => p.id === options.formateurId)
    : [...parties].sort((a, b) => b.seats - a.seats)[0];

  const scored = winning.map(coalition => {
    const components = scoreComponents(
      coalition, parties, threshold, totalSeats, dominantAxis, axes, options.formateurId
    );
    const composite =
      components.coherence * weights.coherence +
      components.minWinning * weights.minWinning +
      components.connectedness * weights.connectedness +
      components.formateurFit * weights.formateurFit;
    return { coalition, components, composite };
  });

  scored.sort((a, b) => b.composite - a.composite);
  const top = scored.slice(0, topK);
  const selectionWeights = softmax(top.map(c => c.composite), temperature);

  const candidates = top.map((c, i) => {
    const totalCoalitionSeats = c.coalition.reduce((s, p) => s + p.seats, 0);
    const members = c.coalition.map(p => ({
      id: p.id,
      name: p.name,
      seats: p.seats,
      share: p.seats / totalCoalitionSeats,
    }));
    return {
      members,
      totalSeats: totalCoalitionSeats,
      excessOverThreshold: totalCoalitionSeats - Math.ceil(required),
      coherence: c.components.coherence,
      scoreComponents: c.components,
      compositeScore: c.composite,
      selectionWeight: selectionWeights[i],
      portfolioAllocation: gamsonPortfolios(c.coalition),
      expectedStabilityMonths: expectedStabilityMonths(
        c.components.coherence,
        totalCoalitionSeats - required,
        totalSeats
      ),
    };
  });

  return {
    formateur: { id: formateur.id, name: formateur.name, seats: formateur.seats },
    winningCoalitions: winning.length,
    candidates,
    metadata: {
      totalSeats,
      threshold,
      requiredSeats: Math.ceil(required),
      dominantAxis,
      axes,
      blockedPairs,
      weights,
      temperature,
    },
  };
}

/**
 * Convenience: load parties from the engine's encoded actor data.
 * Filters to collective actors of type "party" with documented
 * `doctrinal_position` (ideology) — these are the calibratable ones.
 */
export function partiesFromActors(actors) {
  const out = [];
  for (const actor of actors.values()) {
    if (actor.actor_class !== "collective") continue;
    if (actor.collective_type !== "party") continue;
    if (!actor.doctrinal_position) continue;
    out.push({
      id: actor.id,
      name: actor.canonical_name,
      ideology: actor.doctrinal_position,
      // Seats must be provided per-scenario; party records do not carry
      // a single seat count because seats vary by election cycle.
      seats: 0,
    });
  }
  return out;
}
