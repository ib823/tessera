<script lang="ts">
  /**
   * The Plumb Line — "The Field" (Tier 1 overview).
   * A benchmark-anchored beeswarm of the PROVISIONAL conduct signal (single-coder
   * Layer B mean, 0–100). It is explicitly NOT a ranking: there are no rank
   * numbers, the axis is a distribution, every mark is provisional, and dot
   * opacity encodes how little we actually know (coverage). The 5 international
   * benchmarks are drawn as reference lines that bracket the domestic field.
   */
  interface Dim { dimension: string; layer: string; status: string; score: number | null; recorded: { value: unknown } | null; }
  interface Entry { name: string; country: string; affiliation: string; benchmark: boolean; conductCoverage: number; layers: { dimensions: Dim[] }[]; }
  let { subjects }: { subjects: Entry[] } = $props();

  const coalitionOf = (aff: string): string => {
    const m = aff.match(/\(([^)]+)\)/);
    const full = (m ? m[1] : aff).trim();
    const map: Record<string, string> = { 'Pakatan Harapan': 'PH', 'Barisan Nasional': 'BN', 'Gabungan Parti Sarawak': 'GPS', 'Gabungan Rakyat Sabah': 'GRS', 'Perikatan Nasional': 'PN' };
    return map[full] ?? (/technocrat|Non-partisan/i.test(aff) ? 'Ind.' : full);
  };
  // Desaturated, deliberately non-ranking palette (identity only).
  const coalColor: Record<string, string> = {
    PH: '#5b8fb0', BN: '#a8794e', GPS: '#6f9e78', GRS: '#9a8bbf', PN: '#9aa0a6', 'Ind.': '#9aa0a6',
  };

  function conductMean(e: Entry): number | null {
    const v = e.layers.flatMap((l) => l.dimensions)
      .filter((d) => d.layer === 'B' && d.status === 'on-file-provisional-single-coder' && typeof d.recorded?.value === 'number')
      .map((d) => Number(d.recorded!.value));
    if (!v.length) return null;
    return (v.reduce((a, b) => a + b, 0) / v.length) * 25; // 0–4 → 0–100
  }

  type Pt = { e: Entry; x: number; coverage: number; coalition: string };
  const field = subjects.filter((s) => !s.benchmark).map((e) => ({ e, x: conductMean(e), coverage: e.conductCoverage, coalition: coalitionOf(e.affiliation) }))
    .filter((p): p is Pt => p.x !== null).sort((a, b) => a.x - b.x);
  const noConduct = subjects.filter((s) => !s.benchmark && conductMean(s) === null).length;
  const benches = subjects.filter((s) => s.benchmark).map((e) => ({ e, x: conductMean(e) })).filter((b) => b.x !== null).sort((a, b) => (a.x! - b.x!));

  // Geometry (SVG user units; scales responsively via viewBox).
  const W = 1000, padL = 40, padR = 40, axisY = 250, top = 40;
  const innerW = W - padL - padR;
  const sx = (v: number) => padL + (v / 100) * innerW;
  const R = 9, GAP = 2.5, STEP = 2 * R + GAP;

  // Column-binned beeswarm: stack dots upward from the axis within each x-bin.
  const binW = 2 * R;
  const binCount: Record<number, number> = {};
  const dots = field.map((p) => {
    const bin = Math.round(sx(p.x) / binW);
    const k = binCount[bin] ?? 0;
    binCount[bin] = k + 1;
    return { ...p, cx: sx(p.x), cy: axisY - R - 4 - k * STEP };
  });
  const H = axisY + 60; // room for axis ticks + labels

  let hover = $state<null | { name: string; x: number; coverage: number; coalition: string; cx: number; cy: number }>(null);
</script>

<figure class="field">
  <figcaption class="field__cap">
    <strong>The field — provisional conduct signal.</strong> Each dot is one Malaysian minister or the opposition leader, placed by the single-coder Layer B mean (0–100). This is <em>not a rank</em>: it is a draft distribution, every mark is provisional, and fainter dots mean we have less data. The five international benchmarks (vertical lines) bracket the field for reference.
  </figcaption>

  <svg viewBox={`0 0 ${W} ${H}`} class="field__svg" role="img" aria-label="Beeswarm of provisional conduct signal with international benchmark reference lines">
    <!-- benchmark reference lines -->
    {#each benches as b (b.e.name)}
      <line x1={sx(b.x!)} x2={sx(b.x!)} y1={top - 10} y2={axisY} class="field__bench-line" />
      <text x={sx(b.x!)} y={top - 14} class="field__bench-lbl" text-anchor="middle">{b.e.country}</text>
    {/each}

    <!-- axis -->
    <line x1={padL} x2={W - padR} y1={axisY} y2={axisY} class="field__axis" />
    {#each [0, 25, 50, 75, 100] as t (t)}
      <line x1={sx(t)} x2={sx(t)} y1={axisY} y2={axisY + 5} class="field__axis" />
      <text x={sx(t)} y={axisY + 20} class="field__tick" text-anchor="middle">{t}</text>
    {/each}
    <text x={padL} y={axisY + 40} class="field__axislbl">← weaker conduct signal</text>
    <text x={W - padR} y={axisY + 40} class="field__axislbl" text-anchor="end">stronger →</text>

    <!-- dots -->
    {#each dots as d (d.e.name)}
      <circle
        cx={d.cx} cy={d.cy} r={R}
        fill={coalColor[d.coalition] ?? '#9aa0a6'}
        opacity={0.3 + 0.7 * (d.coverage / 100)}
        stroke="var(--bg)" stroke-width="1.5"
        role="button" tabindex="0" aria-label={`${d.e.name}, provisional ${Math.round(d.x)}`}
        onmouseenter={() => (hover = { name: d.e.name, x: d.x, coverage: d.coverage, coalition: d.coalition, cx: d.cx, cy: d.cy })}
        onmouseleave={() => (hover = null)}
        onfocus={() => (hover = { name: d.e.name, x: d.x, coverage: d.coverage, coalition: d.coalition, cx: d.cx, cy: d.cy })}
        onblur={() => (hover = null)}
      />
    {/each}

    {#if hover}
      <g class="field__tip" transform={`translate(${Math.min(Math.max(hover.cx, 90), W - 90)}, ${hover.cy - R - 8})`}>
        <rect x="-88" y="-34" width="176" height="30" rx="5" />
        <text x="0" y="-20" text-anchor="middle" class="field__tip-name">{hover.name}</text>
        <text x="0" y="-9" text-anchor="middle" class="field__tip-sub">{hover.coalition} · provisional {Math.round(hover.x)} · {Math.round(hover.coverage)}% covered</text>
      </g>
    {/if}
  </svg>

  <div class="field__benchkey">
    {#each benches as b (b.e.name)}
      <span><b>{b.e.country}</b> {b.e.name.split(' ').slice(-1)} · {Math.round(b.x!)}</span>
    {/each}
    {#if noConduct > 0}<span class="field__none">+{noConduct} newly-appointed, no conduct record yet</span>{/if}
  </div>
</figure>

<style>
  .field { margin: 0 0 22px; }
  .field__cap { font-size: var(--text-body); line-height: 1.55; color: var(--text-secondary); margin-bottom: 10px; max-width: 70ch; }
  .field__cap strong { color: var(--text-primary); }
  .field__svg { width: 100%; height: auto; display: block; background: var(--card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 6px; }
  .field__axis { stroke: var(--border); stroke-width: 1; }
  .field__tick { fill: var(--text-tertiary); font-size: 13px; font-family: var(--font-display); }
  .field__axislbl { fill: var(--text-tertiary); font-size: 12px; font-family: var(--font-body); }
  .field__bench-line { stroke: var(--text-tertiary); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.55; }
  .field__bench-lbl { fill: var(--text-tertiary); font-size: 12px; font-weight: 700; font-family: var(--font-display); }
  .field__tip rect { fill: var(--text-primary); }
  .field__tip-name { fill: var(--bg); font-size: 12px; font-weight: 700; font-family: var(--font-display); }
  .field__tip-sub { fill: var(--bg); font-size: 10px; opacity: 0.85; font-family: var(--font-body); }
  .field__benchkey { display: flex; flex-wrap: wrap; gap: 10px 16px; margin-top: 8px; font-size: var(--text-xs); color: var(--text-tertiary); }
  .field__benchkey b { color: var(--text-secondary); font-family: var(--font-display); }
  .field__none { font-style: italic; }
  circle[role='button'] { cursor: pointer; }
</style>
