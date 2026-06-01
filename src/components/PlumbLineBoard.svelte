<script lang="ts">
  /**
   * The Plumb Line — board view (Tier 1 wrapper + Tier 2 grid).
   * Honesty-first: it leads with the NOT-RANKED state and the withheld badge,
   * explains the two tracks, then shows every subject as a fingerprint card.
   * There is deliberately no ranking, no podium, no single grade.
   */
  import LeaderFingerprint from './LeaderFingerprint.svelte';
  import PlumbLineField from './PlumbLineField.svelte';
  import PlumbLineHeatmap from './PlumbLineHeatmap.svelte';

  interface Entry {
    name: string; country: string; affiliation: string; benchmark: boolean; ranked: boolean;
    conductCoverage: number; comparabilityClass: string | null; layers: any[]; [k: string]: unknown;
  }
  interface Board {
    methodologyVersion: string; status: string; generatedAt: string; biasAudited: boolean;
    validity: { minPeerSetSize: number; minCoverageToRank: number };
    tracks: { headline: string; conduct: { name: string; dimensions: string[] }; delivery: { name: string; dimensions: string[] } };
    entries: Entry[]; benchmarks: Entry[];
  }
  let { board }: { board: Board } = $props();

  const coalitionOf = (aff: string): string => {
    const m = aff.match(/\(([^)]+)\)/);
    const full = (m ? m[1] : aff).trim();
    const map: Record<string, string> = {
      'Pakatan Harapan': 'PH', 'Barisan Nasional': 'BN', 'Gabungan Parti Sarawak': 'GPS',
      'Gabungan Rakyat Sabah': 'GRS', 'Perikatan Nasional': 'PN',
    };
    if (map[full]) return map[full];
    if (/technocrat|Non-partisan/i.test(aff)) return 'Ind.';
    return full;
  };

  const coalitions = ['All', ...Array.from(new Set(board.entries.map((e) => coalitionOf(e.affiliation))))];
  let filter = $state('All');
  const shown = $derived(
    filter === 'All' ? board.entries : board.entries.filter((e) => coalitionOf(e.affiliation) === filter),
  );

  const total = board.entries.length + board.benchmarks.length;
  const rankedCount = [...board.entries, ...board.benchmarks].filter((e) => e.ranked).length;

  let view = $state<'cards' | 'matrix'>('cards');
</script>

<div class="pl">
  <header class="pl__hero">
    <h1 class="pl__title">The Plumb Line</h1>
    <p class="pl__sub">A non-partisan accountability instrument. It measures conduct and structure, not popularity — and it refuses to publish a rank it cannot yet defend.</p>

    <div class="pl__stats">
      <div class="pl__stat"><b>{total}</b><span>subjects on file</span></div>
      <div class="pl__stat pl__stat--key"><b>{rankedCount}</b><span>ranked</span></div>
      <div class="pl__stat"><b>{board.entries.length}</b><span>cabinet &amp; opposition</span></div>
      <div class="pl__stat"><b>{board.benchmarks.length}</b><span>benchmarks</span></div>
    </div>

    <div class="pl__why">
      <strong>Why nobody is ranked yet.</strong> Every subject is on file with cited data, but the conduct panel is a single-coder draft. A rank is published only once an independent panel of {board.validity.minPeerSetSize}+ coders has scored each item and two bias gates clear (inter-coder reliability and the partisan-signal test). Until then the badge is <em>withheld</em> — by design, not omission. <a class="pl__whylink" href="/plumb-line-why">Walk through the methodology →</a>
    </div>

    <div class="pl__tracks">
      <span class="pl__tk pl__tk--conduct">{board.tracks.conduct.name}</span>
      <span class="pl__tknote">carries the headline — comparable across any portfolio</span>
      <span class="pl__tk pl__tk--delivery">{board.tracks.delivery.name}</span>
      <span class="pl__tknote">shown separately, portfolio-relative, never folded into the headline</span>
    </div>

    <div class="pl__legend">
      <span><i class="lg lg--scored"></i> scored</span>
      <span><i class="lg lg--prov"></i> provisional (1 of {board.validity.minPeerSetSize} coders)</span>
      <span><i class="lg lg--none"></i> awaiting data</span>
    </div>
  </header>

  <PlumbLineField subjects={[...board.entries, ...board.benchmarks]} />

  <div class="pl__controls">
    <nav class="pl__filter" aria-label="Filter by coalition">
      {#each coalitions as c (c)}
        <button class="pl__chip" class:pl__chip--on={filter === c} onclick={() => (filter = c)}>{c}</button>
      {/each}
    </nav>
    <div class="pl__views" role="tablist" aria-label="View">
      <button class="pl__view" class:pl__view--on={view === 'cards'} onclick={() => (view = 'cards')} role="tab" aria-selected={view === 'cards'}>Cards</button>
      <button class="pl__view" class:pl__view--on={view === 'matrix'} onclick={() => (view = 'matrix')} role="tab" aria-selected={view === 'matrix'}>Matrix</button>
    </div>
  </div>

  {#if view === 'cards'}
    <section class="pl__sec">
      <h2 class="pl__seclabel">Malaysian cabinet &amp; opposition · on file, not ranked</h2>
      <div class="pl__grid">
        {#each shown as e (e.name)}
          <LeaderFingerprint entry={e} tracks={board.tracks} />
        {/each}
      </div>
    </section>

    <section class="pl__sec">
      <h2 class="pl__seclabel">International benchmarks · reference points (bracket the scale)</h2>
      <div class="pl__grid">
        {#each board.benchmarks as e (e.name)}
          <LeaderFingerprint entry={e} tracks={board.tracks} />
        {/each}
      </div>
    </section>
  {:else}
    <section class="pl__sec">
      <h2 class="pl__seclabel">Cohort matrix · subjects × dimensions ({filter === 'All' ? 'all' : filter}, with benchmarks)</h2>
      <PlumbLineHeatmap subjects={[...shown, ...board.benchmarks]} />
    </section>
  {/if}

  <footer class="pl__foot">
    Methodology {board.methodologyVersion} · generated {board.generatedAt} · bias-audited badge: <b>{board.biasAudited ? 'granted' : 'withheld'}</b>.
    Scores are provisional single-coder drafts; no leader is ranked. Not an electoral endorsement.
  </footer>
</div>

<style>
  .pl { max-width: 1100px; margin: 0 auto; padding: 8px 16px 80px; font-family: var(--font-body); }
  .pl__hero { margin-bottom: 18px; }
  .pl__title { font-family: var(--font-display); font-size: var(--text-title-lg, 2rem); font-weight: 800; letter-spacing: -0.04em; color: var(--text-primary); margin: 0 0 6px; }
  .pl__sub { font-size: var(--text-reading); line-height: 1.55; color: var(--text-secondary); margin: 0 0 16px; max-width: 60ch; }
  .pl__stats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
  .pl__stat { background: var(--card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px 14px; display: flex; flex-direction: column; min-width: 92px; }
  .pl__stat b { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
  .pl__stat span { font-size: var(--text-micro); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
  .pl__stat--key b { color: var(--score-warning); }
  .pl__why { font-size: var(--text-body); line-height: 1.6; color: var(--text-secondary); background: var(--amber-bg); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 14px; }
  .pl__why strong { color: var(--text-primary); }
  .pl__whylink { color: var(--card-fact-color); font-weight: 700; white-space: nowrap; text-decoration: none; }
  .pl__whylink:hover { text-decoration: underline; }
  .pl__tracks { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; align-items: center; margin-bottom: 12px; }
  .pl__tk { font-family: var(--font-display); font-size: var(--text-xs); font-weight: 700; padding: 2px 9px; border-radius: var(--radius-pill); justify-self: start; }
  .pl__tk--conduct { color: var(--card-fact-color); background: var(--card-fact-bg); }
  .pl__tk--delivery { color: var(--card-reframe-color); background: var(--card-reframe-bg); }
  .pl__tknote { font-size: var(--text-xs); color: var(--text-tertiary); }
  .pl__legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: var(--text-xs); color: var(--text-tertiary); }
  .pl__legend i { display: inline-block; width: 22px; height: 8px; border-radius: var(--radius-pill); vertical-align: middle; margin-right: 5px; }
  .lg--scored { background: var(--card-fact-color); }
  .lg--prov { background: var(--card-fact-color); opacity: 0.45; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.55) 0 3px, transparent 3px 6px); }
  .lg--none { background: var(--bg-sunken); }
  .pl__controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; margin-bottom: 18px; position: sticky; top: 0; background: var(--bg); padding: 8px 0; z-index: 2; }
  .pl__filter { display: flex; flex-wrap: wrap; gap: 6px; }
  .pl__chip { font-family: var(--font-display); font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary); background: var(--card); border: 1px solid var(--border-light); border-radius: var(--radius-pill); padding: 5px 12px; cursor: pointer; }
  .pl__chip--on { color: var(--bg); background: var(--text-primary); border-color: var(--text-primary); }
  .pl__views { display: inline-flex; border: 1px solid var(--border-light); border-radius: var(--radius-pill); overflow: hidden; flex-shrink: 0; }
  .pl__view { font-family: var(--font-display); font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary); background: var(--card); border: 0; padding: 6px 14px; cursor: pointer; }
  .pl__view--on { color: var(--bg); background: var(--text-primary); }
  .pl__sec { margin-bottom: 28px; }
  .pl__seclabel { font-family: var(--font-display); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--text-tertiary); margin: 0 0 12px; }
  .pl__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .pl__foot { font-size: var(--text-xs); color: var(--text-tertiary); line-height: 1.55; border-top: 1px solid var(--border-light); padding-top: 14px; }
  @media (max-width: 520px) { .pl__grid { grid-template-columns: 1fr; } }
</style>
