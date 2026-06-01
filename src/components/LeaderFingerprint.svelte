<script lang="ts">
  /**
   * The Plumb Line — leader "fingerprint" (Tier 2).
   * An honesty-first dimension profile for one subject. It NEVER shows a rank.
   * It encodes, visually: which dimensions are SCORED, which are PROVISIONAL
   * (single-coder Layer B, quarantined), which are on file awaiting a peer set,
   * which are jurisdiction-excluded, and which are simply not yet on file.
   * Coalition colour is deliberately desaturated so it reads as identity, never rank.
   */
  interface Dim {
    dimension: string; layer: string; name: string;
    score: number | null; covered: boolean; peerSetSize: number;
    recorded: { value: unknown; justification?: string; citation?: unknown; coderScores?: number[] } | null;
    status: string; codersOnFile?: number; codersNeeded?: number;
  }
  interface Layer { layer: string; name: string; score: number | null; dimensions: Dim[]; }
  interface Entry {
    name: string; country: string; affiliation: string; benchmark: boolean; ranked: boolean;
    notRankedReason: string | null; coverage: number; conductCoverage: number;
    deliveryCoverage: number; recordedCount: number; comparabilityClass: string | null; layers: Layer[];
  }
  interface Tracks { conduct: { name: string; dimensions: string[] }; delivery: { name: string; dimensions: string[] }; }

  let { entry, tracks }: { entry: Entry; tracks: Tracks } = $props();

  const deliverySet = new Set(tracks?.delivery?.dimensions ?? []);
  const allDims: Dim[] = entry.layers.flatMap((l) => l.dimensions);
  const dimById = (id: string) => allDims.find((d) => d.dimension === id) ?? null;

  // A5 integrity status → pill colour band.
  const a5 = dimById('A5');
  const a5status = a5?.recorded?.value != null ? String(a5.recorded.value) : null;
  const a5band = (s: string | null): 'clean' | 'caution' | 'adverse' | 'none' => {
    if (!s) return 'none';
    if (['none-on-record', 'declared', 'acquitted'].includes(s)) return 'clean';
    if (s === 'convicted') return 'adverse';
    return 'caution'; // pardoned / discharged / ongoing / charged / not-declared
  };

  // Bar fill 0–100 for a dimension, or null when there is nothing to plot.
  function bar(d: Dim): number | null {
    if (d.status === 'scored' && typeof d.score === 'number') return d.score;
    if (d.status === 'on-file-provisional-single-coder' && typeof d.recorded?.value === 'number') {
      return (Number(d.recorded.value) / 4) * 100; // Layer B ordinal 0–4 → %
    }
    return null;
  }

  const SHOWN = new Set([
    'scored', 'on-file-provisional-single-coder', 'on-file', 'on-file-insufficient-peer-set', 'excluded-jurisdiction',
  ]);

  type Row = { d: Dim; track: 'conduct' | 'delivery' };
  function rowsFor(track: 'conduct' | 'delivery') {
    return allDims
      .filter((d) => (deliverySet.has(d.dimension) ? 'delivery' : 'conduct') === track && SHOWN.has(d.status))
      .map((d) => ({ d, track }) as Row);
  }
  function awaiting(track: 'conduct' | 'delivery') {
    return allDims.filter(
      (d) => (deliverySet.has(d.dimension) ? 'delivery' : 'conduct') === track && d.status === 'no-data',
    ).length;
  }

  const conductRows = rowsFor('conduct');
  const deliveryRows = rowsFor('delivery');
  const conductAwait = awaiting('conduct');
  const deliveryAwait = awaiting('delivery');

  // Coalition chip text, desaturated by design.
  const party = entry.affiliation;
  const roleLabel = (entry.comparabilityClass ?? '').replace(/-/g, ' ');

  function statusLabel(d: Dim): string {
    switch (d.status) {
      case 'scored': return 'scored';
      case 'on-file-provisional-single-coder': return `provisional · ${d.codersOnFile ?? 1}/${d.codersNeeded ?? 3} coders`;
      case 'on-file-insufficient-peer-set': return 'on file · awaiting peer set';
      case 'on-file': return 'on file';
      case 'excluded-jurisdiction': return 'excluded · jurisdiction gap';
      default: return '';
    }
  }
</script>

<article class="fp" class:fp--bench={entry.benchmark}>
  <header class="fp__head">
    <div class="fp__id">
      <h3 class="fp__name">{entry.name}</h3>
      <span class="fp__role">{roleLabel}{entry.benchmark ? ' · benchmark' : ''}</span>
    </div>
    <div class="fp__tags">
      <span class="fp__country">{entry.country}</span>
      <span class="fp__party" title={party}>{party}</span>
    </div>
  </header>

  <div class="fp__statusband" class:fp__statusband--bench={entry.benchmark}>
    <span class="fp__dot"></span>
    {entry.benchmark ? 'BENCHMARK — REFERENCE ONLY' : 'ON FILE — NOT RANKED'}
  </div>

  <div class="fp__meta">
    {#if a5status}
      <span class="fp__a5 fp__a5--{a5band(a5status)}" title="Integrity & transparency record (A5) — factual status only">
        integrity: {a5status}
      </span>
    {/if}
    <span class="fp__cov" title="Share of applicable conduct-track dimensions that carry a valid, peer-normalised score">
      conduct coverage
      <span class="fp__covbar"><span class="fp__covfill" style={`width:${entry.conductCoverage}%`}></span></span>
      {Math.round(entry.conductCoverage)}%
    </span>
  </div>

  {#snippet trackBlock(label: string, kind: 'conduct' | 'delivery', rows: Row[], awaitN: number)}
    <section class="fp__track">
      <h4 class="fp__trackname fp__trackname--{kind}">{label}</h4>
      {#if rows.length === 0}
        <p class="fp__empty">No dimension on file yet.</p>
      {/if}
      {#each rows as { d } (d.dimension)}
        {@const pct = bar(d)}
        <div class="fp__row" class:fp__row--prov={d.status === 'on-file-provisional-single-coder'}>
          <span class="fp__dim"><b>{d.dimension}</b> {d.name}</span>
          <span class="fp__track-meter">
            {#if pct !== null}
              <span
                class="fp__fill fp__fill--{kind}"
                class:fp__fill--prov={d.status === 'on-file-provisional-single-coder'}
                style={`width:${Math.max(2, pct)}%`}
              ></span>
            {:else}
              <span class="fp__nofill">{d.status === 'excluded-jurisdiction' ? 'n/a' : '·'}</span>
            {/if}
          </span>
          <span class="fp__rowstatus">{statusLabel(d)}</span>
        </div>
      {/each}
      {#if awaitN > 0}
        <p class="fp__awaiting">+{awaitN} dimension{awaitN === 1 ? '' : 's'} awaiting data</p>
      {/if}
    </section>
  {/snippet}

  {@render trackBlock(tracks?.conduct?.name ?? 'Conduct & Structure', 'conduct', conductRows, conductAwait)}
  {@render trackBlock(tracks?.delivery?.name ?? 'Delivery', 'delivery', deliveryRows, deliveryAwait)}
</article>

<style>
  .fp {
    background: var(--card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: var(--font-body);
  }
  .fp--bench { border-style: dashed; }
  .fp__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .fp__name {
    font-family: var(--font-display); font-weight: 700; font-size: var(--text-reading);
    color: var(--text-primary); margin: 0; letter-spacing: -0.02em; line-height: 1.15;
  }
  .fp__role { font-size: var(--text-micro); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.06em; }
  .fp__tags { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .fp__country { font-family: var(--font-display); font-weight: 700; font-size: var(--text-micro); color: var(--text-tertiary); letter-spacing: 0.08em; }
  .fp__party {
    font-size: var(--text-micro); color: var(--text-secondary);
    background: var(--bg-sunken); border-radius: var(--radius-pill);
    padding: 2px 8px; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    /* desaturated by design: identity, never rank */
  }
  .fp__statusband {
    display: flex; align-items: center; gap: 7px;
    font-family: var(--font-display); font-size: var(--text-micro); font-weight: 700; letter-spacing: 0.08em;
    color: var(--score-warning);
    background: var(--amber-bg); border: 1px solid var(--border-light);
    border-radius: var(--radius-sm); padding: 6px 10px;
  }
  .fp__statusband--bench { color: var(--text-tertiary); }
  .fp__dot { width: 7px; height: 7px; border-radius: var(--radius-round); background: currentColor; opacity: 0.7; }
  .fp__meta { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }
  .fp__a5 { font-size: var(--text-xs); font-weight: 700; padding: 3px 9px; border-radius: var(--radius-pill); letter-spacing: 0.01em; }
  .fp__a5--clean { color: var(--status-green-text); background: var(--status-green-bg); }
  .fp__a5--caution { color: var(--score-warning); background: var(--amber-bg); }
  .fp__a5--adverse { color: var(--status-red); background: var(--status-red-bg); }
  .fp__cov { display: flex; align-items: center; gap: 7px; font-size: var(--text-xs); color: var(--text-tertiary); }
  .fp__covbar { width: 64px; height: 6px; background: var(--bg-sunken); border-radius: var(--radius-pill); overflow: hidden; }
  .fp__covfill { display: block; height: 100%; background: var(--text-tertiary); opacity: 0.55; }
  .fp__track { display: flex; flex-direction: column; gap: 5px; }
  .fp__trackname {
    font-family: var(--font-display); font-size: var(--text-micro); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.09em; margin: 4px 0 1px;
    padding-left: 8px; border-left: 3px solid;
  }
  .fp__trackname--conduct { color: var(--card-fact-color); border-color: var(--card-fact-color); }
  .fp__trackname--delivery { color: var(--card-reframe-color); border-color: var(--card-reframe-color); }
  .fp__row { display: grid; grid-template-columns: minmax(96px, 1.3fr) minmax(70px, 1fr) auto; align-items: center; gap: 8px; }
  .fp__dim { font-size: var(--text-xs); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fp__dim b { color: var(--text-primary); font-family: var(--font-display); }
  .fp__track-meter { height: 8px; background: var(--bg-sunken); border-radius: var(--radius-pill); overflow: hidden; position: relative; }
  .fp__fill { display: block; height: 100%; border-radius: var(--radius-pill); }
  .fp__fill--conduct { background: var(--card-fact-color); }
  .fp__fill--delivery { background: var(--card-reframe-color); }
  .fp__fill--prov {
    opacity: 0.45;
    background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.55) 0 3px, transparent 3px 6px);
    background-blend-mode: overlay;
  }
  .fp__nofill { font-size: var(--text-micro); color: var(--text-tertiary); padding-left: 6px; }
  .fp__rowstatus { font-size: var(--text-micro); color: var(--text-tertiary); white-space: nowrap; text-align: right; }
  .fp__row--prov .fp__rowstatus { color: var(--score-warning); }
  .fp__empty, .fp__awaiting { font-size: var(--text-micro); color: var(--text-tertiary); font-style: italic; margin: 1px 0 0 8px; }
</style>
