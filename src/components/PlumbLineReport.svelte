<script lang="ts">
  /**
   * The Plumb Line — Visual-Capitalist-style report.
   * Three tabs: Overview (key takeaways + write-up), Dataset (ranked tables banded
   * by comparability class, so the certified cohort and the disclosed cohort are
   * visibly separate and there is no cross-class artifact), and Data Sources
   * (methodology of record, the five bias gates with their results, and the full
   * deduplicated citation bibliography). Renders only when the board carries data;
   * the gated page shows a hold view when the deployed board is redacted.
   */
  let { board, audit, poster }: { board: any; audit: any; poster?: string } = $props();

  let tab = $state<'overview' | 'dataset' | 'sources'>('overview');

  const coalOf = (a: string) => {
    const m = a?.match(/\(([^)]+)\)/); const f = (m ? m[1] : a ?? '').trim();
    return ({ 'Pakatan Harapan': 'PH', 'Barisan Nasional': 'BN', 'Gabungan Parti Sarawak': 'GPS', 'Gabungan Rakyat Sabah': 'GRS', 'Perikatan Nasional': 'PN' } as Record<string, string>)[f] ?? (/technocrat|Non-partisan/i.test(a ?? '') ? 'Ind.' : f);
  };
  const COAL: Record<string, string> = { PH: '#2d6cdf', BN: '#d98b2b', GPS: '#2f9e6f', GRS: '#7d5bd0', PN: '#475569', 'Ind.': '#8a8f9c' };

  const entries = board?.entries ?? [];
  const benches = board?.benchmarks ?? [];
  const inClass = (c: string) => entries.filter((e: any) => e.comparabilityClass === c && e.composite != null).sort((a: any, b: any) => b.composite - a.composite);

  // Bands. Federal executive (PM + cabinet) carries the bias-audited certification;
  // state executives are disclosed-not-certified; opposition is shown for symmetry.
  const federal = [...inClass('head-of-government'), ...inClass('cabinet-minister')].sort((a, b) => b.composite - a.composite);
  const stateExec = inClass('sub-national-executive');
  const opp = inClass('opposition-frontbench');
  const benchRanked = [...benches].filter((e: any) => e.composite != null).sort((a: any, b: any) => b.composite - a.composite);

  const bands = [
    { id: 'federal', title: 'Federal cabinet & Prime Minister', tag: 'Bias-audited', tagKind: 'ok', rows: federal, note: 'The editorial layer is certified coalition-blind across this cohort (partisan signal η = 0.26 across four coalitions).' },
    { id: 'state', title: 'State executives', tag: 'Disclosed · not certified', tagKind: 'warn', rows: stateExec, note: 'Shown for completeness. At this cohort size coalition is confounded with state fiscal capacity, so the partisan test cannot yet certify this class. An open finding, not a hidden one.' },
    { id: 'opp', title: 'Opposition leadership', tag: 'n = 1', tagKind: 'muted', rows: opp, note: 'A single subject cannot yet be tested for partisanship; scored on the identical instrument.' },
    { id: 'bench', title: 'International calibration anchors', tag: 'reference', tagKind: 'muted', rows: benchRanked, note: 'World leaders scored on the identical instrument. References, not competitors.' },
  ].filter((b) => b.rows.length);

  const fmtDate = (d?: string) => { try { return new Date(d ?? board?.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return board?.generatedAt ?? ''; } };

  // Citations bibliography, deduped by URL, from every recorded metric.
  type Cite = { title: string; publisher: string; date: string; url: string; tier: number };
  const citeMap = new Map<string, Cite>();
  for (const e of [...entries, ...benches]) {
    for (const l of e.layers ?? []) for (const d of l.dimensions ?? []) {
      const c = d.recorded?.citation; if (c?.url && !citeMap.has(c.url)) citeMap.set(c.url, c);
    }
  }
  const citations = [...citeMap.values()].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const gate = (id: string) => (audit?.gates ?? []).find((g: any) => g.id === id);
</script>

<article class="pl">
  {#if poster}<img class="pl__hero" src={poster} alt="The Plumb Line — Malaysia leader accountability index" loading="eager" />{/if}

  <header class="pl__head">
    <h1>Ranked: Malaysia's Leaders, On the Level</h1>
    <div class="pl__by"><span class="pl__avatar">T4A</span> The Fourth Angle · {fmtDate()}</div>
  </header>

  <nav class="pl__tabs" role="tablist">
    <button role="tab" class:active={tab === 'overview'} onclick={() => (tab = 'overview')}>Overview</button>
    <button role="tab" class:active={tab === 'dataset'} onclick={() => (tab = 'dataset')}>Dataset</button>
    <button role="tab" class:active={tab === 'sources'} onclick={() => (tab = 'sources')}>Data Sources</button>
  </nav>

  {#if tab === 'overview'}
    <section class="pl__body">
      <h2>Key takeaways</h2>
      <ul class="pl__take">
        <li>The Plumb Line scores Malaysian leaders on <b>recorded public conduct</b>, not popularity or ideology — the same yardstick applied to a minister, an opposition figure, and a world benchmark.</li>
        <li>Across <b>23 federal cabinet ministers from four coalitions</b>, the editorial layer is provably coalition-blind: the partisan-signal test reads <b>η = 0.26</b>, below the 0.3 bar. That cohort is <b>bias-audited</b>.</li>
        <li>The multi-reviewer conduct panel clears inter-coder reliability at <b>Krippendorff's α = 0.76</b>.</li>
        <li>State premiers are shown but <b>not yet certified</b>: at this cohort size, coalition is entangled with state fiscal capacity, so the test cannot separate bias from a real capacity gap. We disclose it rather than bury it.</li>
        <li>No rank ships until its bias gates clear. A blank or disclosed cell is not an omission — it is the point.</li>
      </ul>

      <p>This board ranks Malaysian leaders against a fixed, public-record yardstick built from Hansard, federal and state gazettes, Auditor-General reports, asset declarations, and court-record status. Every number traces to a primary source; nothing is drawn from a model's prediction. The instrument scores the <b>integrity of conduct</b> and the <b>delivery of a leader's own stated commitments</b> — never the direction of their politics.</p>

      <p>Scores run on three harmonized layers: a Public Record layer (objective facts), an Editorial Panel layer (a fixed 0–4 rubric for things records cannot capture — crisis handling, reform delivered, institution-building, candor on reversals, and restraint from inflaming Race, Religion or Royalty), and a Composite layer of established political-science indices. The headline number reports <b>Conduct &amp; Structure</b>; portfolio-relative delivery is tracked separately and never folded in.</p>

      <p>What is deliberately excluded: race, religion and royalty as subjects; popularity, polls and social-media following; and policy direction itself. The board never rewards or punishes a political position — only what a leader did with the office, and whether they kept their word.</p>

      <p>The promise is "prove it, then declare it." A rank earns the <b>Bias-Audited</b> badge only when five gates pass — symmetry, source coverage, inter-coder reliability, rank robustness, and the partisan-signal test. Where the test cannot yet isolate partisanship, as with the state executives, the result is disclosed as an open finding instead of certified. That honesty is the product.</p>

      <p class="pl__more"><a href="/plumb-line-why">Read the full methodology, and why certification is per-class →</a></p>
    </section>
  {:else if tab === 'dataset'}
    <section class="pl__body pl__data">
      {#each bands as band (band.id)}
        <div class="pl__band">
          <div class="pl__bandhead">
            <h3>{band.title}</h3>
            <span class="pl__tag pl__tag--{band.tagKind}">{band.tag}</span>
          </div>
          <p class="pl__bandnote">{band.note}</p>
          <table class="pl__tbl">
            <thead><tr><th class="r">Rank</th><th>Name</th><th class="s">Score</th></tr></thead>
            <tbody>
              {#each band.rows as e, i (e.slug ?? e.name)}
                <tr>
                  <td class="r"><span class="pl__rank">{i + 1}</span></td>
                  <td>
                    <span class="pl__name">{e.name}</span>
                    <span class="pl__aff">{e.benchmark ? e.country : (e.affiliation ?? '')}</span>
                  </td>
                  <td class="s">
                    <span class="pl__dot" style={`background:${e.benchmark ? '#334155' : (COAL[coalOf(e.affiliation)] ?? '#8a8f9c')}`}></span>
                    <b>{e.composite}</b>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/each}
      <p class="pl__fine">Score = Conduct &amp; Structure track (0–100). Ranks are within class: a state premier and a federal minister are scored on the same instrument but ranked among their own kind, because their applicable dimensions differ. Where ranks are weight-sensitive the published board shows them as ranges.</p>
    </section>
  {:else}
    <section class="pl__body pl__src">
      <h2>How it is measured</h2>
      <p>Three layers, every input citable: Public Record (objective, ~50%), Editorial Panel (a fixed 0–4 rubric, ~20%, multi-coder), and Composite political-science indices (~30%). Methodology of record: <a href="/plumb-line-why">the methodology explainer</a>. Version {board?.methodologyVersion ?? ''}.</p>

      <h2>Bias audit — the five gates</h2>
      <ul class="pl__gates">
        {#each (audit?.gates ?? []) as g (g.id)}
          <li class:fail={g.passed === false}>
            <span class="pl__gk">{g.passed === false ? '✗' : '✓'}</span>
            <span><b>{g.name}.</b> {g.detail}</span>
          </li>
        {/each}
      </ul>
      {#if !audit}<p class="pl__fine">Gate report loads from the signed audit on the deployed build.</p>{/if}

      <h2>Sources <span class="pl__count">{citations.length} cited</span></h2>
      <p class="pl__fine">Every recorded metric carries a primary-source citation. The full deduplicated bibliography:</p>
      <ol class="pl__bib">
        {#each citations as c (c.url)}
          <li><a href={c.url} target="_blank" rel="noopener">{c.title}</a> <span class="pl__pub">{c.publisher}{c.date ? `, ${c.date}` : ''}{c.tier ? ` · tier ${c.tier}` : ''}</span></li>
        {/each}
      </ol>
    </section>
  {/if}
</article>

<style>
  .pl { max-width: 720px; margin: 0 auto; font-family: var(--font-body); color: var(--text-primary); }
  .pl__hero { width: 100%; height: auto; display: block; border-bottom: 1px solid var(--border-light); }
  .pl__head { padding: 18px 18px 0; }
  .pl__head h1 { font-family: var(--font-display); font-size: clamp(1.5rem, 5vw, 2.1rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin: 0 0 10px; }
  .pl__by { display: flex; align-items: center; gap: 8px; font-size: var(--text-xs); color: var(--text-tertiary); }
  .pl__avatar { display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: var(--text-primary); color: var(--bg); font-family: var(--font-display); font-weight: 800; font-size: 10px; letter-spacing: 0.02em; }
  .pl__tabs { display: flex; gap: 22px; padding: 14px 18px 0; border-bottom: 1px solid var(--border-light); position: sticky; top: 0; background: var(--bg); z-index: 2; }
  .pl__tabs button { all: unset; cursor: pointer; padding: 6px 0 12px; font-family: var(--font-display); font-weight: 700; font-size: var(--text-body); color: var(--text-tertiary); border-bottom: 3px solid transparent; margin-bottom: -1px; }
  .pl__tabs button.active { color: var(--text-primary); border-bottom-color: var(--text-primary); }
  .pl__body { padding: 22px 18px 70px; line-height: 1.62; font-size: var(--text-reading); color: var(--text-secondary); }
  .pl__body h2 { font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin: 26px 0 10px; }
  .pl__body h2:first-child { margin-top: 0; }
  .pl__body p { margin: 0 0 14px; }
  .pl__take { margin: 0 0 18px; padding-left: 20px; }
  .pl__take li { margin: 0 0 9px; }
  .pl__take b, .pl__body p b { color: var(--text-primary); }
  .pl__more a, .pl__body a { color: var(--card-fact-color); font-weight: 700; text-decoration: none; }
  /* dataset */
  .pl__band { margin: 0 0 28px; }
  .pl__bandhead { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
  .pl__bandhead h3 { font-family: var(--font-display); font-size: 1.02rem; font-weight: 800; color: var(--text-primary); margin: 0; }
  .pl__tag { font-size: var(--text-micro); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 8px; border-radius: var(--radius-pill); }
  .pl__tag--ok { background: var(--status-green, #2f9e6f); color: #fff; }
  .pl__tag--warn { background: var(--amber-bg); color: var(--score-warning); border: 1px solid var(--score-warning); }
  .pl__tag--muted { background: var(--bg-sunken); color: var(--text-tertiary); }
  .pl__bandnote { font-size: var(--text-xs); color: var(--text-tertiary); margin: 0 0 10px; line-height: 1.5; }
  .pl__tbl { width: 100%; border-collapse: collapse; }
  .pl__tbl th { text-align: left; font-family: var(--font-display); font-size: var(--text-micro); font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); padding: 6px 8px; border-bottom: 2px solid var(--border-light); }
  .pl__tbl th.r, .pl__tbl td.r { width: 56px; }
  .pl__tbl th.s, .pl__tbl td.s { text-align: right; white-space: nowrap; }
  .pl__tbl td { padding: 11px 8px; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
  .pl__rank { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--bg-sunken); font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--text-secondary); }
  .pl__name { font-weight: 700; color: var(--text-primary); }
  .pl__aff { display: block; font-size: var(--text-micro); color: var(--text-tertiary); margin-top: 1px; }
  .pl__dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 7px; vertical-align: middle; }
  .pl__tbl td.s b { font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }
  .pl__fine { font-size: var(--text-xs); color: var(--text-tertiary); line-height: 1.55; margin: 12px 0 0; }
  /* sources */
  .pl__gates { list-style: none; margin: 0 0 8px; padding: 0; }
  .pl__gates li { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border-light); font-size: var(--text-body); }
  .pl__gk { color: var(--status-green, #2f9e6f); font-weight: 800; }
  .pl__gates li.fail .pl__gk { color: var(--score-critical, var(--status-red)); }
  .pl__count { font-family: var(--font-body); font-size: var(--text-xs); font-weight: 600; color: var(--text-tertiary); }
  .pl__bib { margin: 8px 0 0; padding-left: 22px; font-size: var(--text-xs); color: var(--text-secondary); }
  .pl__bib li { margin: 0 0 8px; line-height: 1.5; }
  .pl__pub { color: var(--text-tertiary); }
</style>
