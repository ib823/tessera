<!--
  DossierFig4Shapley.svelte
  ---------------------------------------------------------------
  Figure 4 — The Shapley pivot.

  Three blocs arranged horizontally: 80 — 30 — 80 seats.
  The 30-seat centre bloc is the pivot: it must be in any feasible
  two-bloc majority. Two burgundy arcs above the blocs label
  "Majority A: 110" and "Majority B: 110".

  Secondary panel below shows the grand coalition (80+80=160) — the
  case where the pivot premium evaporates. This is the contrarian
  correction Stage-2 flagged.
-->
<script lang="ts">
  // Seat dots, deterministic grid.
  function grid(n: number, cols: number, cx: number, cy: number, gap = 11, r = 3.4) {
    const rows = Math.ceil(n / cols);
    const w = (cols - 1) * gap;
    const h = (rows - 1) * gap;
    const x0 = cx - w / 2;
    const y0 = cy - h / 2;
    const dots: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      dots.push({ x: x0 + col * gap, y: y0 + row * gap });
    }
    return { dots, r };
  }

  const LEFT  = grid(80, 10, 240, 290);
  const CENTRE = grid(30, 6, 600, 290);
  const RIGHT = grid(80, 10, 960, 290);

  // Grand-coalition panel (smaller, lower)
  const GL = grid(80, 10, 320, 530, 8, 2.6);
  const GC = grid(30, 6,  600, 530, 8, 2.6);
  const GR = grid(80, 10, 880, 530, 8, 2.6);
</script>

<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="Schematic of a hung parliament: 80-seat left bloc, 30-seat centre bloc, 80-seat right bloc. The 30-seat centre is the necessary partner in either two-bloc majority. Below: the grand-coalition exception where the centre's pivot value evaporates."
>
  <rect width="1200" height="630" fill="#0f0f23" />

  <!-- Title -->
  <g font-family="Inter, system-ui, sans-serif" fill="#F4F1EB">
    <text x="600" y="38" text-anchor="middle" font-size="14" font-weight="500"
          letter-spacing="0.04em">
      The pivotal player — and the case it evaporates
    </text>
  </g>

  <!-- =============== Upper diagram: 80-30-80 with arcs =============== -->

  <!-- Majority A arc: left (240) ↔ centre (600), passing y≈140 -->
  <path d="M 240 240 Q 420 100 600 240"
        fill="none" stroke="#9B2C2C" stroke-width="1.6" />
  <text x="420" y="120" text-anchor="middle"
        font-family="Spectral, Georgia, serif" font-style="italic"
        font-size="15" fill="#9B2C2C">
    Majority A: 110
  </text>

  <!-- Majority B arc: centre ↔ right -->
  <path d="M 600 240 Q 780 100 960 240"
        fill="none" stroke="#9B2C2C" stroke-width="1.6" />
  <text x="780" y="120" text-anchor="middle"
        font-family="Spectral, Georgia, serif" font-style="italic"
        font-size="15" fill="#9B2C2C">
    Majority B: 110
  </text>

  <!-- Burgundy pivot ring around centre -->
  <ellipse cx="600" cy="290" rx="58" ry="44"
           fill="none" stroke="#9B2C2C" stroke-width="1.6"
           stroke-dasharray="3 5" opacity="0.85" />

  <!-- Bloc dots -->
  {#each LEFT.dots as d}
    <circle cx={d.x} cy={d.y} r={LEFT.r} fill="#F4F1EB" opacity="0.92" />
  {/each}
  {#each CENTRE.dots as d}
    <circle cx={d.x} cy={d.y} r={CENTRE.r} fill="#9B2C2C" />
  {/each}
  {#each RIGHT.dots as d}
    <circle cx={d.x} cy={d.y} r={RIGHT.r} fill="#F4F1EB" opacity="0.92" />
  {/each}

  <!-- Bloc totals -->
  <g font-family="Spectral, Georgia, serif" font-style="italic" fill="#F4F1EB">
    <text x="240" y="375" text-anchor="middle" font-size="28">80</text>
    <text x="600" y="375" text-anchor="middle" font-size="28" fill="#9B2C2C">30</text>
    <text x="960" y="375" text-anchor="middle" font-size="28">80</text>
  </g>

  <!-- Annotation -->
  <g font-family="Inter, system-ui, sans-serif" fill="#9CA3AF" text-anchor="middle">
    <text x="600" y="400" font-size="11" letter-spacing="0.04em">
      Necessary partner in either two-bloc majority.
    </text>
    <text x="600" y="416" font-size="11" letter-spacing="0.04em">
      30 of 190 seats = ~16% of seats but ~33% of Shapley–Shubik bargaining power.
    </text>
  </g>

  <!-- Divider -->
  <line x1="200" y1="450" x2="1000" y2="450" stroke="#3F1212" stroke-width="1" />
  <text x="600" y="470" text-anchor="middle"
        font-family="Inter, system-ui, sans-serif"
        font-size="10" font-weight="600"
        letter-spacing="0.22em" fill="#9B2C2C">
    BUT WHEN THE LARGE BLOCS COMBINE…
  </text>

  <!-- =============== Lower panel: grand coalition =============== -->

  <!-- Grand-coalition arc connecting left to right directly -->
  <path d="M 320 510 Q 600 450 880 510"
        fill="none" stroke="#9B2C2C" stroke-width="1.6" opacity="0.7" />
  <text x="600" y="468" text-anchor="middle"
        font-family="Spectral, Georgia, serif" font-style="italic"
        font-size="14" fill="#9B2C2C">
    Grand coalition: 160 — pivot evaporates
  </text>

  <!-- Bloc dots, smaller -->
  {#each GL.dots as d}
    <circle cx={d.x} cy={d.y} r={GL.r} fill="#F4F1EB" opacity="0.92" />
  {/each}
  {#each GC.dots as d}
    <circle cx={d.x} cy={d.y} r={GC.r} fill="#9B2C2C" opacity="0.25" />
  {/each}
  {#each GR.dots as d}
    <circle cx={d.x} cy={d.y} r={GR.r} fill="#F4F1EB" opacity="0.92" />
  {/each}

  <g font-family="Spectral, Georgia, serif" font-style="italic" fill="#F4F1EB">
    <text x="320" y="582" text-anchor="middle" font-size="18">80</text>
    <text x="600" y="582" text-anchor="middle" font-size="18" fill="#9B2C2C" opacity="0.4">30</text>
    <text x="880" y="582" text-anchor="middle" font-size="18">80</text>
  </g>

  <text x="600" y="610" text-anchor="middle"
        font-family="Inter, system-ui, sans-serif" font-size="11"
        fill="#9CA3AF" letter-spacing="0.04em">
    The centre's bargaining power depends entirely on the two large blocs choosing to compete.
  </text>
</svg>
