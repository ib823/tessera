<script lang="ts">
  /**
   * The Plumb Line — cohort matrix (Tier 3).
   * Subjects (rows) × dimensions (columns). Each cell encodes STATUS, not just a
   * value: scored, provisional (hatched), on file, jurisdiction-excluded, or no
   * data. Its honest job is to show that the board is still mostly gaps, slowly
   * filling — the opposite of a confident league table.
   */
  interface Dim { dimension: string; status: string; score: number | null; recorded: { value: unknown } | null; }
  interface Entry { name: string; country: string; benchmark: boolean; layers: { dimensions: Dim[] }[]; }
  let { subjects }: { subjects: Entry[] } = $props();

  const DIMS = [
    { id: 'A2', label: 'Presence', track: 'conduct' }, { id: 'A5', label: 'Integrity', track: 'conduct' },
    { id: 'B1', label: 'Crisis', track: 'conduct' }, { id: 'B2', label: 'Reform', track: 'conduct' },
    { id: 'B3', label: 'Consensus', track: 'conduct' }, { id: 'B4', label: 'Candor', track: 'conduct' },
    { id: 'B5', label: '3R restraint', track: 'conduct' }, { id: 'C1', label: 'Pivotality', track: 'conduct' },
    { id: 'C3', label: 'Network', track: 'conduct' },
    { id: 'A1', label: 'Legislative', track: 'delivery' }, { id: 'A3', label: 'Pledges', track: 'delivery' },
    { id: 'A4', label: 'Fiscal', track: 'delivery' }, { id: 'C2', label: 'Governance', track: 'delivery' },
  ];
  const conductN = DIMS.filter((d) => d.track === 'conduct').length;

  function lookup(e: Entry) {
    const m = new Map<string, Dim>();
    for (const d of e.layers.flatMap((l) => l.dimensions)) m.set(d.dimension, d);
    return m;
  }
  function cell(d: Dim | undefined, track: string) {
    if (!d || d.status === 'no-data') return { cls: 'c--none', v: 0, t: 'no data' };
    if (d.status === 'excluded-jurisdiction') return { cls: 'c--excl', v: 0, t: 'excluded — jurisdiction gap' };
    if (d.status === 'on-file-provisional-single-coder') {
      const v = typeof d.recorded?.value === 'number' ? Number(d.recorded.value) / 4 : 0.5;
      return { cls: `c--prov c--${track}`, v, t: `provisional · ${Math.round(v * 4)}/4` };
    }
    if (d.status === 'scored') return { cls: `c--scored c--${track}`, v: typeof d.score === 'number' ? d.score / 100 : 0.5, t: `scored · ${Math.round(d.score ?? 0)}` };
    return { cls: 'c--onfile', v: 0.5, t: 'on file · awaiting peer set' };
  }

  const rows = subjects.map((e) => ({ e, map: lookup(e) }));
</script>

<div class="hm">
  <div class="hm__scroll">
    <div class="hm__grid" style={`grid-template-columns: 150px repeat(${DIMS.length}, minmax(26px, 1fr));`}>
      <!-- track band header -->
      <div class="hm__corner"></div>
      <div class="hm__band hm__band--conduct" style={`grid-column: span ${conductN};`}>Conduct &amp; Structure</div>
      <div class="hm__band hm__band--delivery" style={`grid-column: span ${DIMS.length - conductN};`}>Delivery</div>

      <!-- dimension headers -->
      <div class="hm__corner hm__corner--sub">subject</div>
      {#each DIMS as d (d.id)}
        <div class="hm__col" title={d.label}><span>{d.id}</span></div>
      {/each}

      <!-- rows -->
      {#each rows as { e, map } (e.name)}
        <div class="hm__name" class:hm__name--bench={e.benchmark} title={e.name}>
          <span class="hm__country">{e.country}</span>{e.name}
        </div>
        {#each DIMS as d (d.id)}
          {@const c = cell(map.get(d.id), d.track)}
          <div class={`hm__cell ${c.cls}`} style={`--v:${c.v}`} title={`${e.name} — ${d.label}: ${c.t}`}></div>
        {/each}
      {/each}
    </div>
  </div>
  <div class="hm__legend">
    <span><i class="k k--scored"></i> scored</span>
    <span><i class="k k--prov"></i> provisional (1 coder)</span>
    <span><i class="k k--onfile"></i> on file</span>
    <span><i class="k k--excl"></i> excluded</span>
    <span><i class="k k--none"></i> no data</span>
  </div>
</div>

<style>
  .hm__scroll { overflow-x: auto; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: var(--card); }
  .hm__grid { display: grid; gap: 2px; padding: 8px; min-width: 560px; }
  .hm__corner { font-size: var(--text-micro); color: var(--text-tertiary); display: flex; align-items: flex-end; }
  .hm__corner--sub { text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 3px; }
  .hm__band { font-family: var(--font-display); font-size: var(--text-micro); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 6px; border-radius: var(--radius-sm); align-self: end; }
  .hm__band--conduct { color: var(--card-fact-color); background: var(--card-fact-bg); }
  .hm__band--delivery { color: var(--card-reframe-color); background: var(--card-reframe-bg); }
  .hm__col { font-family: var(--font-display); font-size: var(--text-micro); font-weight: 700; color: var(--text-tertiary); text-align: center; align-self: end; }
  .hm__name { font-size: var(--text-xs); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 6px; display: flex; align-items: center; gap: 5px; }
  .hm__name--bench { font-style: italic; }
  .hm__country { font-family: var(--font-display); font-size: 9px; font-weight: 700; color: var(--text-tertiary); background: var(--bg-sunken); border-radius: 3px; padding: 1px 3px; }
  .hm__cell { aspect-ratio: 1; min-height: 20px; border-radius: 3px; background: var(--bg-sunken); }
  .c--none { background: var(--bg-sunken); opacity: 0.5; }
  .c--excl { background: repeating-linear-gradient(45deg, var(--bg-sunken) 0 3px, transparent 3px 6px); border: 1px solid var(--border-light); }
  .c--onfile { background: var(--text-tertiary); opacity: 0.25; }
  .c--scored.c--conduct { background: var(--card-fact-color); opacity: calc(0.25 + 0.7 * var(--v)); }
  .c--scored.c--delivery { background: var(--card-reframe-color); opacity: calc(0.25 + 0.7 * var(--v)); }
  .c--prov.c--conduct { background: var(--card-fact-color); opacity: calc(0.2 + 0.4 * var(--v)); background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 4px); }
  .c--prov.c--delivery { background: var(--card-reframe-color); opacity: calc(0.2 + 0.4 * var(--v)); background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 4px); }
  .hm__legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; font-size: var(--text-xs); color: var(--text-tertiary); }
  .hm__legend i { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: middle; margin-right: 4px; }
  .k--scored { background: var(--card-fact-color); }
  .k--prov { background: var(--card-fact-color); opacity: 0.5; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 4px); }
  .k--onfile { background: var(--text-tertiary); opacity: 0.3; }
  .k--excl { background: repeating-linear-gradient(45deg, var(--bg-sunken) 0 3px, var(--border) 3px 6px); }
  .k--none { background: var(--bg-sunken); opacity: 0.5; }
</style>
