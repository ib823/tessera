<script lang="ts">
  /**
   * The Plumb Line — Tier 4 scrollytelling explainer: "Why nobody is ranked yet".
   * A sticky figure that evolves as the reader scrolls through the methodology,
   * climaxing in the rank-range collapse: with one coder the uncertainty bands
   * overlap (no defensible order); as an independent panel forms and the two bias
   * gates clear, the bands narrow until a rank — published as RANGES, never points
   * — emerges. Leaders are illustrative (A–F), never real subjects.
   */
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const steps = [
    { t: 'Why nobody is ranked yet', b: 'The Plumb Line has 37 leaders on file and ranks exactly zero of them. That is not an unfinished feature — it is the instrument refusing to publish a number it cannot defend. Scroll to see what has to happen first.' },
    { t: 'On file is not ranked', b: 'Every subject carries cited data. But a rank is a claim about order between people, and order needs evidence the current data cannot yet support. So the board shows position with uncertainty — never a podium.' },
    { t: 'Two tracks, one honest headline', b: 'Conduct & Structure compares fairly across any portfolio, so it carries the headline. Delivery is confounded by portfolio size, so it is shown separately and never folded in. A Works minister and a Communications minister can share one fair comparison only on the conduct track.' },
    { t: 'One coder is a draft', b: 'The conduct panel is, today, a single reviewer. One coder’s scores carry wide uncertainty: the bands overlap so heavily that no order between leaders is defensible. The board stays NOT RANKED — by rule, a single author cannot move it.' },
    { t: 'Add independent coders', b: 'Reliability comes from agreement between people who scored the same items without conferring. As a panel of three or more forms, the uncertainty bands narrow and a shape begins to emerge.' },
    { t: 'Two gates must clear', b: 'Inter-coder reliability — Krippendorff’s α ≥ 0.667 — proves the coders agree. The partisan-signal test proves coalition does not explain the editorial residual: the panel is reading conduct, not party. Both must pass.' },
    { t: 'Only then — a rank, as ranges', b: 'Once the gates clear, ranks publish as ranges, never false-precise points: where bands still overlap, leaders share a range. The bias-audited badge is granted. The number finally means what it says.' },
    { t: 'Until then: the withheld badge is the point', b: 'A blank rank column is not an omission to apologise for. It is the single most trust-building thing on the page: we will not rank these people until the evidence earns it.' },
  ];

  let active = $state(0);
  let stepEls: HTMLElement[] = [];

  // Illustrative leaders (NOT real subjects), sorted by an illustrative conduct value.
  const demo = [
    { id: 'A', v: 74, rank: '1' }, { id: 'B', v: 66, rank: '2' }, { id: 'C', v: 61, rank: '3–4' },
    { id: 'D', v: 57, rank: '3–4' }, { id: 'E', v: 49, rank: '5' }, { id: 'F', v: 42, rank: '6' },
  ];
  const CFG: Record<number, { half: number; coders: number; gate: 'pending' | 'testing' | 'pass'; stamp: string; ok: boolean; ranks: boolean }> = {
    3: { half: 33, coders: 1, gate: 'pending', stamp: 'NOT RANKED', ok: false, ranks: false },
    4: { half: 17, coders: 3, gate: 'pending', stamp: 'STILL NOT RANKED', ok: false, ranks: false },
    5: { half: 11, coders: 5, gate: 'testing', stamp: 'GATES PENDING', ok: false, ranks: false },
    6: { half: 7, coders: 5, gate: 'pass', stamp: 'RANK PUBLISHED — RANGES', ok: true, ranks: true },
  };
  const scene = $derived(active <= 1 ? 'A' : active === 2 ? 'B' : 'C');
  const cfg = $derived(CFG[Math.min(Math.max(active, 3), 6)]);

  const half = tweened(33, { duration: 700, easing: cubicOut });
  let reduced = false;
  $effect(() => {
    if (scene === 'C') half.set(cfg.half, { duration: reduced ? 0 : 700 });
  });

  // geometry
  const X0 = 80, TW = 300, rowH = 30, top = 96;
  const sx = (v: number) => X0 + (v / 100) * TW;

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = stepEls.indexOf(e.target as HTMLElement);
            if (i >= 0) active = i;
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    for (const el of stepEls) if (el) io.observe(el);
    return () => io.disconnect();
  });
</script>

<div class="scrolly">
  <div class="scrolly__figwrap">
    <figure class="scrolly__fig" aria-hidden="true">
      <svg viewBox="0 0 460 320" class="scrolly__svg">
        {#if scene === 'A'}
          <text x="230" y="120" text-anchor="middle" class="big">37</text>
          <text x="230" y="148" text-anchor="middle" class="lbl">subjects on file</text>
          <text x="230" y="196" text-anchor="middle" class="big big--key">0</text>
          <text x="230" y="224" text-anchor="middle" class="lbl">ranked</text>
          <g class="badge badge--withheld" transform="translate(230,262)">
            <rect x="-92" y="-15" width="184" height="30" rx="15" />
            <text x="0" y="5" text-anchor="middle" class="badge__t">BIAS-AUDITED BADGE · WITHHELD</text>
          </g>
        {:else if scene === 'B'}
          <text x="230" y="40" text-anchor="middle" class="lbl">two tracks</text>
          <g transform="translate(40,70)">
            <rect x="0" y="0" width="380" height="92" rx="12" class="tk tk--conduct" />
            <text x="16" y="26" class="tk__h tk__h--conduct">CONDUCT &amp; STRUCTURE</text>
            <text x="16" y="48" class="tk__s">comparable across any portfolio</text>
            <text x="16" y="70" class="tk__s tk__s--strong">→ carries the headline rank</text>
          </g>
          <g transform="translate(40,178)">
            <rect x="0" y="0" width="380" height="92" rx="12" class="tk tk--delivery" />
            <text x="16" y="26" class="tk__h tk__h--delivery">DELIVERY</text>
            <text x="16" y="48" class="tk__s">confounded by portfolio size</text>
            <text x="16" y="70" class="tk__s">shown separately · never folded in</text>
          </g>
        {:else}
          <!-- coder pips -->
          <text x="20" y="34" class="cap">independent coders</text>
          {#each Array(5) as _, i (i)}
            <circle cx={150 + i * 22} cy="29" r="7" class={i < cfg.coders ? 'pip pip--on' : 'pip'} />
          {/each}
          <text x={150 + 5 * 22 + 4} y="34" class="cap">{cfg.coders} of 3+</text>

          <!-- stamp -->
          <g transform="translate(340,58) rotate(-7)">
            <rect x="-78" y="-15" width="156" height="30" rx="5" class={cfg.ok ? 'stamp stamp--ok' : 'stamp'} />
            <text x="0" y="5" text-anchor="middle" class={cfg.ok ? 'stamp__t stamp__t--ok' : 'stamp__t'}>{cfg.stamp}</text>
          </g>

          <!-- rank-range bands -->
          {#each demo as d, i (d.id)}
            {@const y = top + i * rowH}
            <line x1={X0} x2={X0 + TW} y1={y} y2={y} class="trk" />
            {#if cfg.ranks}
              <text x="40" y={y + 4} text-anchor="middle" class="rank">{d.rank}</text>
            {:else}
              <text x="40" y={y + 4} text-anchor="middle" class="rank rank--q">?</text>
            {/if}
            <text x="64" y={y + 4} text-anchor="end" class="leadlbl">{d.id}</text>
            <rect
              x={sx(Math.max(0, d.v - $half))}
              y={y - 7}
              width={sx(Math.min(100, d.v + $half)) - sx(Math.max(0, d.v - $half))}
              height="14" rx="7"
              class={cfg.ranks ? 'band band--ok' : 'band'}
            />
            <line x1={sx(d.v)} x2={sx(d.v)} y1={y - 7} y2={y + 7} class="ctr" />
          {/each}

          <!-- gates -->
          <g transform={`translate(${X0},${top + 6 * rowH + 6})`}>
            <g class={`gate gate--${cfg.gate}`}>
              <rect x="0" y="0" width="142" height="26" rx="13" />
              <text x="71" y="17" text-anchor="middle" class="gate__t">α reliability · {cfg.gate === 'pass' ? '0.71 ✓' : cfg.gate === 'testing' ? 'testing' : 'pending'}</text>
            </g>
            <g class={`gate gate--${cfg.gate}`} transform="translate(158,0)">
              <rect x="0" y="0" width="142" height="26" rx="13" />
              <text x="71" y="17" text-anchor="middle" class="gate__t">partisan-signal · {cfg.gate === 'pass' ? 'clear ✓' : cfg.gate === 'testing' ? 'testing' : 'pending'}</text>
            </g>
          </g>
        {/if}
      </svg>
    </figure>
  </div>

  <div class="scrolly__steps">
    {#each steps as s, i (i)}
      <section class="step" class:step--on={active === i} bind:this={stepEls[i]}>
        <h2 class="step__t">{s.t}</h2>
        <p class="step__b">{s.b}</p>
      </section>
    {/each}
  </div>
</div>

<style>
  .scrolly { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
  .scrolly__figwrap { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; }
  .scrolly__fig { margin: 0; width: 100%; }
  .scrolly__svg { width: 100%; height: auto; background: var(--card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 8px; font-family: var(--font-display); }
  .scrolly__steps { display: flex; flex-direction: column; }
  .step { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; opacity: 0.32; transition: opacity 0.4s; }
  .step--on { opacity: 1; }
  .step__t { font-family: var(--font-display); font-size: var(--text-reading-lg); font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; margin: 0 0 10px; }
  .step__b { font-family: var(--font-body); font-size: var(--text-reading); line-height: 1.6; color: var(--text-secondary); margin: 0; }

  .big { font-size: 64px; font-weight: 800; fill: var(--text-primary); }
  .big--key { fill: var(--score-warning); }
  .lbl { font-size: 13px; fill: var(--text-tertiary); letter-spacing: 0.1em; text-transform: uppercase; }
  .badge rect { fill: var(--amber-bg); stroke: var(--border-light); }
  .badge__t { fill: var(--score-warning); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; }
  .tk { stroke: var(--border-light); }
  .tk--conduct { fill: var(--card-fact-bg); }
  .tk--delivery { fill: var(--card-reframe-bg); }
  .tk__h { font-size: 13px; font-weight: 800; letter-spacing: 0.04em; }
  .tk__h--conduct { fill: var(--card-fact-color); }
  .tk__h--delivery { fill: var(--card-reframe-color); }
  .tk__s { font-size: 12px; fill: var(--text-secondary); font-family: var(--font-body); }
  .tk__s--strong { fill: var(--text-primary); font-weight: 700; }

  .cap { font-size: 12px; fill: var(--text-tertiary); }
  .pip { fill: none; stroke: var(--text-tertiary); stroke-width: 1.5; opacity: 0.6; }
  .pip--on { fill: var(--card-fact-color); stroke: var(--card-fact-color); opacity: 1; }
  .stamp rect { fill: var(--amber-bg); stroke: var(--score-warning); }
  .stamp--ok rect { fill: var(--status-green-bg); stroke: var(--status-green); }
  .stamp__t { fill: var(--score-warning); font-size: 11px; font-weight: 800; letter-spacing: 0.04em; }
  .stamp__t--ok { fill: var(--status-green-text, var(--status-green)); }
  .trk { stroke: var(--border-light); stroke-width: 1; }
  .band { fill: var(--card-fact-color); opacity: 0.4; }
  .band--ok { opacity: 0.85; }
  .ctr { stroke: var(--text-primary); stroke-width: 1.5; opacity: 0.7; }
  .leadlbl { font-size: 12px; font-weight: 700; fill: var(--text-secondary); }
  .rank { font-size: 12px; font-weight: 800; fill: var(--text-primary); }
  .rank--q { fill: var(--text-tertiary); }
  .gate rect { fill: var(--bg-sunken); stroke: var(--border-light); }
  .gate__t { font-size: 10px; font-weight: 700; fill: var(--text-tertiary); }
  .gate--pass rect { fill: var(--status-green-bg); stroke: var(--status-green); }
  .gate--pass .gate__t { fill: var(--status-green-text, var(--status-green)); }
  .gate--testing rect { fill: var(--amber-bg); }
  .gate--testing .gate__t { fill: var(--score-warning); }

  @media (max-width: 720px) {
    .scrolly { grid-template-columns: 1fr; }
    .scrolly__figwrap { top: 0; height: 56vh; }
    .scrolly__steps { margin-top: 4px; }
    .step { min-height: 70vh; }
  }
  @media (prefers-reduced-motion: reduce) { .step { transition: none; } }
</style>
