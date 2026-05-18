<!--
  DossierFig5Brokerage.svelte
  ---------------------------------------------------------------
  Figure 5 — The brokerage stack.

  Five vertical layers showing what a defector with seats actually
  brings, with opacity decreasing top-to-bottom (the visible defector
  at top is supported by progressively-less-visible base layers).

  A thin burgundy arrow on the left runs through all five labelled
  "What he actually brings".

  Editorial caveat: the "300–500 branch chairs per division" figure
  the earlier spec carried was removed in Stage 3 as unsourced.
  Layers stand on their own as categories.
-->
<script lang="ts">
  const LAYERS = [
    {
      title: 'Division Head',
      sub: 'The visible defector',
      opacity: 1.0,
    },
    {
      title: 'Branch chairs & party membership networks',
      sub: 'The local door-knockers',
      opacity: 0.82,
    },
    {
      title: 'JKKK village chiefs & mosque committees',
      sub: 'Welfare gatekeepers',
      opacity: 0.64,
    },
    {
      title: 'Felda settler representatives',
      sub: 'In Felda-adjacent seats',
      opacity: 0.5,
    },
    {
      title: 'Local contractor networks',
      sub: 'The cash plumbing',
      opacity: 0.4,
    },
  ];

  const PANEL_X = 320;
  const PANEL_W = 720;
  const PANEL_H = 78;
  const PANEL_GAP = 12;
  const TOP_Y = 90;
</script>

<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="A vertical stack of five layers showing what a defector with seats actually delivers: Division Head, Branch chairs and party membership networks, JKKK village chiefs and mosque committees, Felda settler representatives, Local contractor networks. Top layers are fully visible; lower layers fade, signalling that the apparent defector at top is supported by an invisible base."
>
  <rect width="1200" height="630" fill="#0f0f23" />

  <!-- Title -->
  <g font-family="Inter, system-ui, sans-serif" fill="#F4F1EB">
    <text x="320" y="50" font-size="14" font-weight="500" letter-spacing="0.04em">
      What a defector actually brings
    </text>
    <text x="320" y="68" font-size="11" fill="#9CA3AF" letter-spacing="0.06em">
      Layers visible to outside observers diminish with depth — the seat is the smallest part.
    </text>
  </g>

  <!-- Left vertical "what he actually brings" rail -->
  <g>
    <line x1="240" y1={TOP_Y + 10}
          x2="240" y2={TOP_Y + LAYERS.length * (PANEL_H + PANEL_GAP) - 20}
          stroke="#9B2C2C" stroke-width="2" />
    <!-- Arrowhead at bottom -->
    <path d="M 232 {TOP_Y + LAYERS.length * (PANEL_H + PANEL_GAP) - 20}
             L 240 {TOP_Y + LAYERS.length * (PANEL_H + PANEL_GAP) - 8}
             L 248 {TOP_Y + LAYERS.length * (PANEL_H + PANEL_GAP) - 20} Z"
          fill="#9B2C2C" />
    <!-- Rotated label -->
    <text x="220" y={TOP_Y + (LAYERS.length * (PANEL_H + PANEL_GAP)) / 2}
          text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="11"
          font-weight="600" letter-spacing="0.22em" fill="#9B2C2C"
          transform="rotate(-90, 220, {TOP_Y + (LAYERS.length * (PANEL_H + PANEL_GAP)) / 2})">
      WHAT HE ACTUALLY BRINGS
    </text>
  </g>

  <!-- Stack panels -->
  {#each LAYERS as layer, i}
    {@const y = TOP_Y + i * (PANEL_H + PANEL_GAP)}
    <g>
      <rect x={PANEL_X} y={y} width={PANEL_W} height={PANEL_H}
            fill="#9B2C2C" fill-opacity={layer.opacity} />
      <!-- Layer number, left edge -->
      <text x={PANEL_X + 22} y={y + 30}
            font-family="Inter, system-ui, sans-serif" font-size="10"
            font-weight="600" letter-spacing="0.22em"
            fill={layer.opacity > 0.5 ? '#0f0f23' : '#F4F1EB'}>
        LAYER {i + 1}
      </text>
      <!-- Title -->
      <text x={PANEL_X + 22} y={y + 56}
            font-family="Spectral, Georgia, serif" font-style="italic"
            font-size="20"
            fill={layer.opacity > 0.5 ? '#0f0f23' : '#F4F1EB'}>
        {layer.title}
      </text>
      <!-- Subtitle, right-aligned -->
      <text x={PANEL_X + PANEL_W - 22} y={y + 56}
            text-anchor="end"
            font-family="Inter, system-ui, sans-serif" font-size="12"
            font-style="italic"
            fill={layer.opacity > 0.5 ? 'rgba(15,15,35,0.7)' : '#F4F1EB'}>
        {layer.sub}
      </text>
    </g>
  {/each}

  <!-- Footer note -->
  <text x="320" y="610" font-family="Inter, system-ui, sans-serif" font-size="11"
        fill="#9CA3AF" letter-spacing="0.04em">
    Layer-count specifics removed pending citation. The hierarchy is observable; the exact counts are not.
  </text>
</svg>
