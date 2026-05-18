<!--
  DossierFig2VoterBars.svelte
  ---------------------------------------------------------------
  Figure 2 — Voters per parliamentary seat (GE15, post-UNDI18).
  Horizontal bar chart.

  Data is hardcoded here intentionally — figure data is editorial,
  not user-supplied, and is locked behind the editorial review
  pipeline. If a value changes, change it here AND update the
  caption in src/data/dossiers/D001.json (timeline-section model
  binds caption to value via co-located edits).

  Verified data — SPR PRU15 voter-roll, both reviewer passes.
  Hulu Rajang dropped pending pdf reconciliation (see fig spec).
-->
<script lang="ts">
  type Row = { name: string; state: string; voters: number };

  const DATA: Row[] = [
    { name: 'P102 Bangi',             state: 'Selangor',       voters: 303_430 },
    { name: 'P111 Kota Raja',         state: 'Selangor',       voters: 244_712 },
    { name: 'P106 Damansara',         state: 'Selangor',       voters: 239_103 },
    { name: 'P110 Klang',             state: 'Selangor',       voters: 208_913 },
    { name: 'P109 Kapar',             state: 'Selangor',       voters: 189_369 },
    { name: 'P078 Cameron Highlands', state: 'Pahang',         voters:  46_020 },
    { name: 'P125 Putrajaya',         state: 'Federal Terr.',  voters:  42_881 },
    { name: 'P222 Lawas',             state: 'Sarawak',        voters:  33_655 },
    { name: 'P207 Igan',              state: 'Sarawak',        voters:  28_290 },
  ];

  const MAX = 305_000;
  const PLOT = { x: 290, y: 80, w: 760, h: 430 };
  const ROW_H = PLOT.h / DATA.length;
  const BAR_H = 26;

  function scale(v: number): number {
    return (v / MAX) * PLOT.w;
  }

  function fmt(n: number): string {
    return n.toLocaleString('en-MY');
  }
</script>

<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="Horizontal bar chart of registered voters by parliamentary constituency. Bangi 303,430 vs Igan 28,290 — a 10.7-to-1 ratio."
>
  <rect width="1200" height="630" fill="#0f0f23" />

  <!-- Title / unit label -->
  <g font-family="Inter, system-ui, sans-serif" fill="#F4F1EB">
    <text x="290" y="40" font-size="14" font-weight="500" letter-spacing="0.04em">
      Registered voters per parliamentary constituency
    </text>
    <text x="290" y="60" font-size="11" fill="#9CA3AF" letter-spacing="0.06em">
      GE15 (2022), post-UNDI18. Source: SPR PRU15 voter-roll statistics.
    </text>
  </g>

  <!-- 100k reference line (subtle) -->
  {@const ref = PLOT.x + scale(100_000)}
  <line x1={ref} y1={PLOT.y - 8} x2={ref} y2={PLOT.y + PLOT.h + 6}
        stroke="#3F1212" stroke-width="1" stroke-dasharray="2 4" />
  <text x={ref} y={PLOT.y + PLOT.h + 24} text-anchor="middle"
        font-family="Inter, system-ui, sans-serif" font-size="11"
        fill="#9CA3AF" letter-spacing="0.04em">100,000</text>

  <!-- Bars + labels -->
  {#each DATA as row, i}
    {@const cy = PLOT.y + i * ROW_H + ROW_H / 2}
    {@const w  = scale(row.voters)}

    <!-- Constituency label (left) -->
    <text x="276" y={cy - 2} text-anchor="end" font-family="Inter, system-ui, sans-serif"
          font-size="13" fill="#F4F1EB" font-weight="400">
      {row.name}
    </text>
    <text x="276" y={cy + 13} text-anchor="end" font-family="Inter, system-ui, sans-serif"
          font-size="11" fill="#9CA3AF">
      {row.state}
    </text>

    <!-- The bar -->
    <rect x={PLOT.x} y={cy - BAR_H / 2} width={w} height={BAR_H}
          fill="#9B2C2C" />

    <!-- Value label (right of bar) -->
    <text x={PLOT.x + w + 12} y={cy + 4} font-family="Spectral, Georgia, serif"
          font-style="italic" font-size="14" fill="#F4F1EB">
      {fmt(row.voters)}
    </text>
  {/each}

  <!-- Ratio annotation -->
  <g font-family="Inter, system-ui, sans-serif" fill="#9CA3AF">
    <line x1="900" y1="120" x2="900" y2="500" stroke="#3F1212" stroke-width="1" />
    <text x="916" y="124" font-size="11" font-weight="600" letter-spacing="0.18em"
          text-transform="uppercase" fill="#9B2C2C">
      RATIO
    </text>
    <text x="916" y="148" font-family="Spectral, Georgia, serif" font-style="italic"
          font-size="36" fill="#F4F1EB">
      10.7×
    </text>
    <text x="916" y="172" font-size="11" letter-spacing="0.04em">
      Bangi vs Igan
    </text>
    <text x="916" y="190" font-size="11" letter-spacing="0.04em">
      303,430 ÷ 28,290
    </text>
  </g>
</svg>
