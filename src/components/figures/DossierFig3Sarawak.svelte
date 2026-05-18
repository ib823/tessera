<!--
  DossierFig3Sarawak.svelte
  ---------------------------------------------------------------
  Figure 3 — Sarawak State Sales Tax revenue on petroleum, 2019–2024.
  Vertical bar chart.

  ACTUAL bars: burgundy 100%.
  ESTIMATE / PROJECTION bars: burgundy 50% opacity, dashed top edge.

  2023 and 2024 values are reviewer-1 figures pending PDF reconciliation
  (see fig spec note). The qualitative range RM2.7bn–RM4.2bn holds
  under either reviewer.
-->
<script lang="ts">
  type Bar = { year: number; value: number; kind: 'ACTUAL' | 'ESTIMATE' | 'PROJECTION' };

  const DATA: Bar[] = [
    { year: 2019, value: 2.957, kind: 'ACTUAL' },
    { year: 2020, value: 2.744, kind: 'ACTUAL' },
    { year: 2021, value: 3.162, kind: 'ACTUAL' },
    { year: 2022, value: 4.231, kind: 'ACTUAL' },
    { year: 2023, value: 3.844, kind: 'ESTIMATE' },
    { year: 2024, value: 3.518, kind: 'PROJECTION' },
  ];

  const Y_MAX = 4.5;
  const PLOT = { x: 100, y: 80, w: 1000, h: 420 };
  const BAR_W = 100;
  const BAR_GAP = (PLOT.w - DATA.length * BAR_W) / DATA.length;

  function yOf(v: number): number {
    return PLOT.y + PLOT.h - (v / Y_MAX) * PLOT.h;
  }

  const GRIDLINES = [1, 2, 3, 4];
</script>

<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="Vertical bar chart of Sarawak State Sales Tax revenue from petroleum, 2019 through 2024, in billions of ringgit. Range RM2.7bn to RM4.2bn."
>
  <rect width="1200" height="630" fill="#0f0f23" />

  <!-- Title -->
  <g font-family="Inter, system-ui, sans-serif" fill="#F4F1EB">
    <text x="100" y="40" font-size="14" font-weight="500" letter-spacing="0.04em">
      Sarawak State Sales Tax — petroleum revenue (RM bn)
    </text>
    <text x="100" y="60" font-size="11" fill="#9CA3AF" letter-spacing="0.06em">
      Source: Sarawak State Budget speeches 2022, 2023, 2024.
    </text>
  </g>

  <!-- Y gridlines -->
  {#each GRIDLINES as g}
    <line x1={PLOT.x} y1={yOf(g)} x2={PLOT.x + PLOT.w} y2={yOf(g)}
          stroke="#3F1212" stroke-width="1" />
    <text x={PLOT.x - 14} y={yOf(g) + 4} text-anchor="end"
          font-family="Inter, system-ui, sans-serif" font-size="11"
          fill="#9CA3AF">{g}.0</text>
  {/each}
  <text x={PLOT.x - 14} y={yOf(0) + 4} text-anchor="end"
        font-family="Inter, system-ui, sans-serif" font-size="11"
        fill="#9CA3AF">0</text>

  <!-- Baseline -->
  <line x1={PLOT.x} y1={yOf(0)} x2={PLOT.x + PLOT.w} y2={yOf(0)}
        stroke="#3F1212" stroke-width="1.5" />

  <!-- Bars -->
  {#each DATA as bar, i}
    {@const x = PLOT.x + BAR_GAP / 2 + i * (BAR_W + BAR_GAP)}
    {@const top = yOf(bar.value)}
    {@const h = yOf(0) - top}
    {@const isActual = bar.kind === 'ACTUAL'}

    <rect x={x} y={top} width={BAR_W} height={h}
          fill="#9B2C2C"
          fill-opacity={isActual ? 1 : 0.5}
          stroke={isActual ? 'none' : '#9B2C2C'}
          stroke-width={isActual ? 0 : 1.5}
          stroke-dasharray={isActual ? 'none' : '4 4'} />

    <!-- Value above bar -->
    <text x={x + BAR_W / 2} y={top - 12} text-anchor="middle"
          font-family="Spectral, Georgia, serif" font-style="italic"
          font-size="15" fill="#F4F1EB">
      {bar.value.toFixed(2)}
    </text>

    <!-- Year below baseline -->
    <text x={x + BAR_W / 2} y={yOf(0) + 26} text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="14"
          font-weight="500" fill="#F4F1EB">
      {bar.year}
    </text>
    <text x={x + BAR_W / 2} y={yOf(0) + 44} text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="10"
          letter-spacing="0.16em" fill={isActual ? '#9CA3AF' : '#9B2C2C'}>
      {bar.kind}
    </text>
  {/each}

  <!-- Caveat block -->
  <g font-family="Inter, system-ui, sans-serif">
    <text x="100" y="595" font-size="11" fill="#9CA3AF">
      <tspan font-weight="600" fill="#9B2C2C" letter-spacing="0.16em">NOTE  </tspan>
      <tspan>2019–2022 audited actuals. 2023 revised estimate. 2024 initial budget projection. Annual collection varies with crude prices.</tspan>
    </text>
  </g>
</svg>
