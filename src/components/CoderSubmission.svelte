<script lang="ts">
  /**
   * The Plumb Line — coder submission builder.
   * A generic, data-free form for recruited Layer B coders: they enter their id,
   * add one block per leader they scored (slug from their packet), pick 0–4 (or
   * "no qualifying event") for B1–B5 with a one-line dated justification, and
   * download a submission JSON that ingests via scripts/ingest-coder-scores.mjs.
   * No leader data or existing scores are embedded — blindness is preserved.
   */
  const DIMS = [
    ['B1', 'Crisis handling'], ['B2', 'Reform delivered vs promised'],
    ['B3', 'Consensus & institution-building'], ['B4', 'Candor on reversals'],
    ['B5', 'Process discipline (3R restraint)'],
  ] as const;

  type Row = { slug: string; scores: Record<string, string>; why: Record<string, string> };
  const blank = (): Row => ({ slug: '', scores: { B1: '', B2: '', B3: '', B4: '', B5: '' }, why: { B1: '', B2: '', B3: '', B4: '', B5: '' } });

  let coder = $state('');
  let rows = $state<Row[]>([blank()]);
  let copied = $state(false);

  function build() {
    return {
      coder: coder.trim() || 'anonymous',
      submittedAt: new Date().toISOString().slice(0, 10),
      scores: rows
        .filter((r) => r.slug.trim())
        .map((r) => {
          const o: Record<string, unknown> = { leader: r.slug.trim(), why: {} };
          for (const [d] of DIMS) {
            const v = r.scores[d];
            o[d] = v === '' || v === 'na' ? null : Number(v);
            (o.why as Record<string, string>)[d] = r.why[d].trim() || (o[d] === null ? 'no qualifying event' : '');
          }
          return o;
        }),
    };
  }
  const json = $derived(JSON.stringify(build(), null, 2));
  const valid = $derived(rows.some((r) => r.slug.trim()) && rows.every((r) => !r.slug.trim() || DIMS.every(([d]) => r.scores[d] !== '' )));

  function download() {
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plumbline-${(coder.trim() || 'coder').replace(/[^a-z0-9]+/gi, '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function copy() { await navigator.clipboard.writeText(json); copied = true; setTimeout(() => (copied = false), 1500); }
</script>

<div class="cs">
  <label class="cs__coder">Coder id / pseudonym
    <input bind:value={coder} placeholder="e.g. coder-2 (kept anonymous)" />
  </label>

  {#each rows as row, i (i)}
    <fieldset class="cs__block">
      <legend>Leader {i + 1}</legend>
      <label class="cs__slug">Slug (from your packet header)
        <input bind:value={row.slug} placeholder="paste the slug from your packet header" />
      </label>
      {#each DIMS as [d, name] (d)}
        <div class="cs__dim">
          <div class="cs__dimhead"><b>{d}</b> {name}</div>
          <div class="cs__row">
            <select bind:value={row.scores[d]} aria-label={`${d} score`}>
              <option value="">score…</option>
              <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
              <option value="na">no qualifying event</option>
            </select>
            <input class="cs__why" bind:value={row.why[d]} placeholder="why — one dated line (required)" />
          </div>
        </div>
      {/each}
      {#if rows.length > 1}<button class="cs__rm" onclick={() => (rows = rows.filter((_, j) => j !== i))}>Remove leader</button>{/if}
    </fieldset>
  {/each}

  <button class="cs__add" onclick={() => (rows = [...rows, blank()])}>+ Add another leader</button>

  <div class="cs__out">
    <div class="cs__actions">
      <button class="cs__primary" disabled={!valid} onclick={download}>Download submission JSON</button>
      <button onclick={copy}>{copied ? 'Copied ✓' : 'Copy JSON'}</button>
      {#if !valid}<span class="cs__hint">Add a slug and a score for every B1–B5 (use “no qualifying event” where none applies).</span>{/if}
    </div>
    <pre class="cs__json">{json}</pre>
  </div>
</div>

<style>
  .cs { max-width: 760px; font-family: var(--font-body); display: flex; flex-direction: column; gap: 14px; }
  .cs label { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .cs input, .cs select { font-family: var(--font-body); font-size: var(--text-body); color: var(--text-primary); background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 7px 9px; }
  .cs__block { border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 14px; display: flex; flex-direction: column; gap: 10px; background: var(--card); }
  .cs__block legend { font-family: var(--font-display); font-weight: 800; color: var(--text-primary); padding: 0 6px; }
  .cs__dim { border-top: 1px solid var(--border-light); padding-top: 8px; }
  .cs__dimhead { font-size: var(--text-body); color: var(--text-secondary); margin-bottom: 5px; }
  .cs__dimhead b { font-family: var(--font-display); color: var(--text-primary); }
  .cs__row { display: flex; gap: 8px; }
  .cs__row select { flex-shrink: 0; }
  .cs__why { flex: 1; }
  .cs__rm { align-self: flex-start; background: none; border: 0; color: var(--score-critical, var(--status-red)); font-size: var(--text-xs); cursor: pointer; padding: 2px 0; }
  .cs__add { align-self: flex-start; font-family: var(--font-display); font-weight: 700; font-size: var(--text-body); color: var(--card-fact-color); background: none; border: 1px dashed var(--border-light); border-radius: var(--radius-pill); padding: 8px 16px; cursor: pointer; }
  .cs__out { border-top: 1px solid var(--border-light); padding-top: 14px; }
  .cs__actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px; }
  .cs__actions button { font-family: var(--font-display); font-weight: 700; font-size: var(--text-body); border: 1px solid var(--border-light); border-radius: var(--radius-pill); padding: 8px 16px; cursor: pointer; background: var(--card); color: var(--text-primary); }
  .cs__primary { background: var(--text-primary) !important; color: var(--bg) !important; }
  .cs__primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .cs__hint { font-size: var(--text-xs); color: var(--text-tertiary); }
  .cs__json { background: var(--bg-sunken); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px; font-size: var(--text-xs); color: var(--text-secondary); overflow-x: auto; max-height: 260px; }
</style>
