<script lang="ts">
  /**
   * The Plumb Line — ranked range-board (the EPL-style league table).
   * Renders ONLY ranked entries (entries with a published rank range), so it is
   * dormant until the bias panel grants the badge and ranks exist. Honesty marks:
   * rank is a RANGE (never a false-precise point), the conduct composite carries
   * its uncertainty, benchmarks are references (not good/bad "zones"), and there
   * is no moral verdict — just conduct, structure, and movement.
   */
  interface Layer { layer: string; score: number | null; }
  interface Entry {
    name: string; country: string; affiliation: string; benchmark: boolean; ranked: boolean;
    rank: number | null; rankRange: [number, number] | null; composite: number | null;
    deliveryComposite: number | null; conductCoverage: number; layers: Layer[];
    trend?: number | null; // signed change vs previous edition, when editions exist
  }
  let { entries, tracks }: { entries: Entry[]; tracks: { conduct: { name: string }; delivery: { name: string } } } = $props();

  const coalitionOf = (a: string) => { const m = a.match(/\(([^)]+)\)/); const f = (m ? m[1] : a).trim(); const k: Record<string, string> = { 'Pakatan Harapan': 'PH', 'Barisan Nasional': 'BN', 'Gabungan Parti Sarawak': 'GPS', 'Gabungan Rakyat Sabah': 'GRS', 'Perikatan Nasional': 'PN' }; return k[f] ?? (/technocrat|Non-partisan/i.test(a) ? 'Ind.' : f); };
  const COAL: Record<string, string> = { PH: '#5b8fb0', BN: '#a8794e', GPS: '#6f9e78', GRS: '#9a8bbf', PN: '#9aa0a6', 'Ind.': '#9aa0a6' };
  const layer = (e: Entry, id: string) => e.layers.find((l) => l.layer === id)?.score ?? null;
  const posLabel = (e: Entry) => (e.rankRange && e.rankRange[0] !== e.rankRange[1] ? `${e.rankRange[0]}–${e.rankRange[1]}` : `${e.rank ?? '—'}`);

  let sortKey = $state<'rank' | 'composite' | 'coverage'>('rank');
  let dir = $state<1 | -1>(1);
  function setSort(k: 'rank' | 'composite' | 'coverage') { if (sortKey === k) dir = (dir * -1) as 1 | -1; else { sortKey = k; dir = k === 'rank' ? 1 : -1; } }
  const rows = $derived([...entries].sort((a, b) => {
    const va = sortKey === 'rank' ? (a.rank ?? 99) : sortKey === 'composite' ? (a.composite ?? -1) : a.conductCoverage;
    const vb = sortKey === 'rank' ? (b.rank ?? 99) : sortKey === 'composite' ? (b.composite ?? -1) : b.conductCoverage;
    return (va - vb) * dir;
  }));
</script>

<div class="rb">
  <div class="rb__scroll">
    <table class="rb__t">
      <thead>
        <tr>
          <th class="rb__num"><button onclick={() => setSort('rank')}>Pos</button></th>
          <th class="rb__lead">Leader</th>
          <th class="rb__c"><button onclick={() => setSort('composite')}>{tracks.conduct.name}</button></th>
          <th class="rb__mini" title="Layer A — objective">A</th>
          <th class="rb__mini" title="Layer B — conduct panel">B</th>
          <th class="rb__mini" title="Layer C — structural">C</th>
          <th class="rb__mini rb__del" title="{tracks.delivery.name} — portfolio-relative">Del</th>
          <th class="rb__mini"><button onclick={() => setSort('coverage')}>Cov</button></th>
          <th class="rb__mini">Form</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as e (e.name)}
          <tr class:rb__rowbench={e.benchmark}>
            <td class="rb__num"><span class="rb__pos">{posLabel(e)}</span></td>
            <td class="rb__lead">
              <span class="rb__dot" style={`background:${COAL[coalitionOf(e.affiliation)] ?? '#9aa0a6'}`}></span>
              <span class="rb__name">{e.name}</span>
              <span class="rb__coal">{e.benchmark ? e.country : coalitionOf(e.affiliation)}</span>
            </td>
            <td class="rb__c">
              <span class="rb__big">{e.composite ?? '—'}</span>
              <span class="rb__bar"><span class="rb__fill" style={`width:${e.composite ?? 0}%`}></span></span>
            </td>
            {#each ['A', 'B', 'C'] as L (L)}
              {@const v = layer(e, L)}
              <td class="rb__mini">{v == null ? '·' : Math.round(v)}</td>
            {/each}
            <td class="rb__mini rb__del">{e.deliveryComposite ?? '·'}</td>
            <td class="rb__mini">{Math.round(e.conductCoverage)}%</td>
            <td class="rb__mini">
              {#if e.trend == null}<span class="rb__new">new</span>
              {:else if e.trend > 0}<span class="rb__up">▲{e.trend}</span>
              {:else if e.trend < 0}<span class="rb__down">▼{Math.abs(e.trend)}</span>
              {:else}<span class="rb__flat">–</span>{/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="rb__foot">Rank is a <strong>range</strong>, not a point: where conduct bands overlap, leaders share a position. Benchmarks (italic) are international references, not competitors. No moral verdict is implied — only conduct, structure, and movement.</p>
</div>

<style>
  .rb__scroll { overflow-x: auto; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: var(--card); }
  .rb__t { width: 100%; min-width: 640px; border-collapse: collapse; font-family: var(--font-body); }
  .rb__t thead th { text-align: left; font-family: var(--font-display); font-size: var(--text-micro); font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); padding: 10px 8px; border-bottom: 1px solid var(--border-light); position: sticky; top: 0; background: var(--card); }
  .rb__t thead th button { all: unset; cursor: pointer; color: inherit; }
  .rb__t thead th button:hover { color: var(--text-primary); }
  .rb__t tbody tr { border-bottom: 1px solid var(--border-light); }
  .rb__t tbody tr:hover { background: var(--bg-sunken); }
  .rb__rowbench { font-style: italic; opacity: 0.85; }
  .rb__num { width: 54px; text-align: center; }
  .rb__pos { font-family: var(--font-display); font-weight: 800; font-size: var(--text-body); color: var(--text-primary); }
  .rb__lead { min-width: 200px; padding: 9px 8px; }
  .rb__dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 7px; vertical-align: middle; }
  .rb__name { font-weight: 700; color: var(--text-primary); font-size: var(--text-body); }
  .rb__coal { font-size: var(--text-micro); color: var(--text-tertiary); margin-left: 6px; }
  .rb__c { min-width: 120px; padding: 9px 8px; }
  .rb__big { font-family: var(--font-display); font-weight: 800; font-size: var(--text-body-lg); color: var(--card-fact-color); }
  .rb__bar { display: block; height: 5px; width: 90px; background: var(--bg-sunken); border-radius: var(--radius-pill); overflow: hidden; margin-top: 3px; }
  .rb__fill { display: block; height: 100%; background: var(--card-fact-color); }
  .rb__mini { width: 48px; text-align: center; font-size: var(--text-body); color: var(--text-secondary); padding: 9px 4px; }
  .rb__del { color: var(--card-reframe-color); }
  .rb__new { font-size: var(--text-micro); color: var(--text-tertiary); }
  .rb__up { color: var(--status-green); font-weight: 700; }
  .rb__down { color: var(--status-red); font-weight: 700; }
  .rb__flat { color: var(--text-tertiary); }
  .rb__foot { font-size: var(--text-xs); color: var(--text-tertiary); line-height: 1.5; margin: 10px 2px 0; }
  .rb__foot strong { color: var(--text-secondary); }
</style>
