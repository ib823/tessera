<!--
  DossierFig6AntiHop.svelte
  ---------------------------------------------------------------
  Figure 6 — The Article 49A anti-hopping loophole.

  Two-panel comparison.
  Left:  individual defection — blocked. MP walking between parties
         is intercepted by a burgundy slash. Seat becomes vacant.
  Right: party-level exit — allowed. A whole party with five members
         moves cleanly to a new coalition. Seats retained.

  The visual makes the loophole legible in a glance. The legal text
  (Article 49A) is in the quote section directly preceding this
  figure in the dossier.
-->
<script lang="ts">
  // Stick figure helper — a small SVG silhouette
  // (head + shoulders + body — single colour, scaled by cx,cy,h).
</script>

<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="Two-panel diagram. Left: individual MP defection between parties is blocked by Article 49A — seat becomes vacant. Right: party-level exit to a new coalition is allowed — seats retained."
>
  <rect width="1200" height="630" fill="#0f0f23" />

  <!-- Vertical divider between panels -->
  <line x1="600" y1="60" x2="600" y2="570"
        stroke="#9B2C2C" stroke-width="1" stroke-dasharray="2 6" />

  <!-- ============================ LEFT PANEL ============================ -->
  <g>
    <text x="60" y="60"
          font-family="Inter, system-ui, sans-serif" font-size="10"
          font-weight="600" letter-spacing="0.22em" fill="#9B2C2C">
      INDIVIDUAL DEFECTION
    </text>
    <text x="60" y="92"
          font-family="Spectral, Georgia, serif" font-style="italic"
          font-size="26" fill="#F4F1EB">
      Blocked.
    </text>

    <!-- Party A box -->
    <rect x="80" y="220" width="160" height="140"
          fill="none" stroke="#F4F1EB" stroke-width="1.5" opacity="0.7" />
    <text x="160" y="200" text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="13"
          fill="#F4F1EB" letter-spacing="0.04em">Party A</text>

    <!-- Party B box -->
    <rect x="360" y="220" width="160" height="140"
          fill="none" stroke="#F4F1EB" stroke-width="1.5" opacity="0.7" />
    <text x="440" y="200" text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="13"
          fill="#F4F1EB" letter-spacing="0.04em">Party B</text>

    <!-- MP walking from Party A toward Party B -->
    <g transform="translate(290, 268)" stroke="#F4F1EB" stroke-width="1.6"
       fill="none" stroke-linecap="round">
      <circle cx="0" cy="-22" r="9" />
      <line x1="0" y1="-13" x2="0" y2="14" />
      <line x1="0" y1="-3" x2="-12" y2="6" />
      <line x1="0" y1="-3" x2="12" y2="6" />
      <line x1="0" y1="14" x2="-8" y2="34" />
      <line x1="0" y1="14" x2="10" y2="34" />
    </g>
    <text x="290" y="328" text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="10"
          fill="#9CA3AF" letter-spacing="0.16em">MP</text>

    <!-- Arrow A → B -->
    <line x1="250" y1="290" x2="350" y2="290"
          stroke="#F4F1EB" stroke-width="1.4" opacity="0.5"
          stroke-dasharray="3 5" />

    <!-- Burgundy NO circle with slash -->
    <g transform="translate(300, 290)">
      <circle cx="0" cy="0" r="38" fill="none" stroke="#9B2C2C" stroke-width="3" />
      <line x1="-28" y1="-28" x2="28" y2="28" stroke="#9B2C2C" stroke-width="3" />
    </g>

    <!-- Caption -->
    <g font-family="Inter, system-ui, sans-serif" fill="#F4F1EB">
      <text x="60" y="450" font-size="14" font-weight="500" letter-spacing="0.04em">
        Seat becomes vacant.
      </text>
      <text x="60" y="476" font-size="13" fill="#9CA3AF" letter-spacing="0.02em">
        Article 49A(1)(a)–(b), Federal Constitution.
      </text>
      <text x="60" y="514" font-size="12" fill="#9CA3AF" font-style="italic"
            letter-spacing="0.02em">
        Inserted 2022. Triggers a casual vacancy when an MP resigns from
      </text>
      <text x="60" y="532" font-size="12" fill="#9CA3AF" font-style="italic"
            letter-spacing="0.02em">
        or ceases to be a member of the party they were elected under.
      </text>
    </g>
  </g>

  <!-- ============================ RIGHT PANEL ============================ -->
  <g>
    <text x="660" y="60"
          font-family="Inter, system-ui, sans-serif" font-size="10"
          font-weight="600" letter-spacing="0.22em" fill="#9B2C2C">
      PARTY-LEVEL EXIT
    </text>
    <text x="660" y="92"
          font-family="Spectral, Georgia, serif" font-style="italic"
          font-size="26" fill="#F4F1EB">
      Allowed.
    </text>

    <!-- Party A box with five small figures inside -->
    <rect x="660" y="200" width="200" height="180"
          fill="rgba(155, 44, 44, 0.10)" stroke="#9B2C2C" stroke-width="1.5" />
    <text x="760" y="186" text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="13"
          fill="#F4F1EB" letter-spacing="0.04em">Party A (whole)</text>

    {#each [0,1,2,3,4] as i}
      {@const x = 685 + (i % 3) * 60}
      {@const y = 240 + Math.floor(i / 3) * 70}
      <g transform="translate({x}, {y})" stroke="#F4F1EB" stroke-width="1.4"
         fill="none" stroke-linecap="round" opacity="0.92">
        <circle cx="0" cy="-12" r="7" />
        <line x1="0" y1="-5" x2="0" y2="14" />
        <line x1="0" y1="0" x2="-8" y2="6" />
        <line x1="0" y1="0" x2="8" y2="6" />
        <line x1="0" y1="14" x2="-6" y2="28" />
        <line x1="0" y1="14" x2="7" y2="28" />
      </g>
    {/each}

    <!-- Big arrow Party A → New Coalition -->
    <g>
      <line x1="870" y1="290" x2="1000" y2="290"
            stroke="#9B2C2C" stroke-width="2.5" />
      <path d="M 990 282 L 1010 290 L 990 298 Z" fill="#9B2C2C" />
    </g>

    <!-- New Coalition box -->
    <rect x="1020" y="240" width="140" height="100"
          fill="none" stroke="#9B2C2C" stroke-width="1.5" stroke-dasharray="2 4" />
    <text x="1090" y="232" text-anchor="middle"
          font-family="Inter, system-ui, sans-serif" font-size="13"
          fill="#9B2C2C" letter-spacing="0.04em">New Coalition</text>
    <text x="1090" y="296" text-anchor="middle"
          font-family="Spectral, Georgia, serif" font-style="italic"
          font-size="14" fill="#F4F1EB">en bloc</text>

    <!-- Caption -->
    <g font-family="Inter, system-ui, sans-serif" fill="#F4F1EB">
      <text x="660" y="450" font-size="14" font-weight="500" letter-spacing="0.04em">
        Seats retained.
      </text>
      <text x="660" y="476" font-size="13" fill="#9CA3AF" letter-spacing="0.02em">
        Article 49A does not bind the party as a corporate body.
      </text>
      <text x="660" y="514" font-size="12" fill="#9CA3AF" font-style="italic"
            letter-spacing="0.02em">
        The resignation route is closed. The party-vote, dissolution,
      </text>
      <text x="660" y="532" font-size="12" fill="#9CA3AF" font-style="italic"
            letter-spacing="0.02em">
        and expulsion routes were deliberately left open.
      </text>
    </g>
  </g>
</svg>
