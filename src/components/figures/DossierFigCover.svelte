<!--
  DossierFigCover.svelte
  ---------------------------------------------------------------
  PLACEHOLDER for the canonical T4A continuous-line cover illustration.

  The real artefact is generated externally by the T4A image
  pipeline (Midjourney / DALL-E / Sora) using the prompt in
  docs/dossier-D001-figures.md under "Figure cover" and saved to
  /public/dossiers/D001/fig-cover.png. The reader reads from that
  path via the `src` on the figure record.

  Until that file lands, this inline SVG renders an honest stand-in
  so the layout doesn't break. It is intentionally simple and
  marked as a placeholder so it cannot be mistaken for the real one.
-->
<script lang="ts">
  interface Props {
    /** When true, hides the "Placeholder" stamp. Set this once the
     *  real PNG is in place — though by then the reader should have
     *  switched to <img src> via DossierFigure rather than this
     *  Svelte stand-in. */
    hidePlaceholderStamp?: boolean;
  }

  let { hidePlaceholderStamp = false }: Props = $props();
</script>

<svg
  viewBox="0 0 1200 630"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Cover illustration placeholder — four figures around a table, a window suggesting a distant crowd"
>
  <!-- Backdrop -->
  <rect width="1200" height="630" fill="#0f0f23" />

  <!-- Single-stroke approximation: figures around a table, window, distant crowd. -->
  <g
    fill="none"
    stroke="#F4F1EB"
    stroke-width="2.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity="0.92"
  >
    <!-- One continuous-ish path — entry top left, traces table, four heads, window, crowd, exit lower right with T4A. -->
    <path d="
      M 120 380
      C 200 360, 260 360, 320 380
      C 360 392, 400 396, 440 396
      C 480 396, 520 392, 560 380
      C 590 372, 605 372, 615 388
      L 615 408
      C 605 422, 580 426, 555 422
      L 200 422
      C 175 426, 150 422, 140 408
      L 140 388
      C 142 380, 132 380, 120 380 Z
    " />

    <!-- Figure 1 — leftmost, head + shoulders -->
    <path d="M 175 330 q 6 -34 36 -34 q 30 0 36 34" />
    <circle cx="211" cy="282" r="14" />

    <!-- Figure 2 -->
    <path d="M 290 320 q 7 -38 40 -38 q 33 0 40 38" />
    <circle cx="330" cy="266" r="14" />

    <!-- Figure 3 -->
    <path d="M 410 320 q 7 -38 40 -38 q 33 0 40 38" />
    <circle cx="450" cy="266" r="14" />

    <!-- Figure 4 — rightmost -->
    <path d="M 525 330 q 6 -34 36 -34 q 30 0 36 34" />
    <circle cx="561" cy="282" r="14" />

    <!-- Window frame, far back -->
    <rect x="780" y="160" width="280" height="220" rx="2" />
    <line x1="920" y1="160" x2="920" y2="380" />
    <line x1="780" y1="270" x2="1060" y2="270" />

    <!-- Distant crowd, faint dots-into-line -->
    <g opacity="0.55">
      <path d="M 800 320 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0" />
      <path d="M 800 350 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0" />
    </g>

    <!-- T4A signature, lower right -->
    <g transform="translate(1020, 540)" stroke-width="2">
      <path d="M 0 0 q 30 -28 60 0 q 8 -10 20 -10 m -10 0 l 0 30 m 10 -22 q 20 -20 32 0 l 0 22 m 12 -22 q 16 -22 30 -2 l 0 24" fill="none" />
    </g>
  </g>

  {#if !hidePlaceholderStamp}
    <!-- Honest "placeholder" mark so it cannot be confused with the real artefact. -->
    <g transform="translate(40, 40)" font-family="Inter, system-ui, sans-serif" fill="#9B2C2C">
      <rect width="160" height="22" fill="#9B2C2C" />
      <text x="80" y="15" text-anchor="middle" font-size="11" font-weight="600" letter-spacing="0.22em" fill="#F4F1EB">
        PLACEHOLDER
      </text>
      <text x="0" y="50" font-size="11" letter-spacing="0.04em" fill="#9CA3AF" font-style="italic">
        Real artefact: see /public/dossiers/D001/fig-cover.png
      </text>
    </g>
  {/if}
</svg>
