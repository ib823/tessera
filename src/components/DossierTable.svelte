<!--
  DossierTable.svelte
  ---------------------------------------------------------------
  Semantic <table> for fig-7's international comparison.

  Decision: HTML table, not SVG. Reasons (Q4 answer):
  • Screen-reader navigable (proper <thead>/<th scope>/<tbody>).
  • Print stylesheet handles it natively — no rasterisation step.
  • Smaller bundle, no client SVG to parse.
  • Themeable from the same design tokens as the rest of the
    dossier (header burgundy via --accent, body warm white).

  The data is currently passed as a prop so the component is
  reusable for future dossiers. D001 wires it in DossierReader.

  Mobile: the table is horizontally scrollable inside its wrapper.
-->
<script lang="ts">
  interface Props {
    headers: string[];
    rows: string[][];
    caption?: string;
    sourceLine?: string;
  }

  let { headers, rows, caption, sourceLine }: Props = $props();
</script>

<div class="fig-table-wrap" style:overflow-x="auto">
  <table class="fig-table">
    {#if caption}
      <caption class="sr-only">{caption}</caption>
    {/if}
    <thead>
      <tr>
        {#each headers as h}
          <th scope="col">{h}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          {#each row as cell, ci}
            {#if ci === 0}
              <th scope="row">{cell}</th>
            {:else}
              <td>{cell}</td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if sourceLine}
  <p class="figure__source">{sourceLine}</p>
{/if}

<style>
  /* sr-only — visually hidden but available to assistive tech.
     Scoped to this component so we don't depend on a global util. */
  :global(.sr-only) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
