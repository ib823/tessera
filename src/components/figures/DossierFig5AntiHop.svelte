<!--
  DossierFig5AntiHop.svelte
  ---------------------------------------------------------------
  Figure 5 — The Article 49A anti-hopping loophole.

  Renders the canonical T4A continuous-line illustration as the
  figure body, with the two legal-text caption blocks overlaid as
  HTML beneath the image. Two-column layout maps to the metaphor
  in the illustration: closed bolted door on the left (individual
  defection blocked) versus open arch on the right (party-level
  exit allowed).

  The illustration carries the metaphor; the captions carry the
  legal precision. Text lives outside the PNG so screen readers
  can reach it, dark-mode and future-translation work cleanly,
  and the layout can adapt to narrow viewports.
-->
<script lang="ts">
  // No props — the figure record on the dossier holds title / alt /
  // caption; this component renders the visual body only.
</script>

<div class="fig5">
  <img
    class="fig5__img"
    src="/dossiers/D001/fig-5-bg.jpg"
    alt="Continuous-line illustration. Left: a single figure in a suit standing in front of a closed door with a padlock, three burgundy strokes flaring around the lock. Caption beneath: INDIVIDUAL ROUTE. Right: an open archway with three figures in suits walking through it together. Caption beneath: COORDINATED PARTY-LEVEL ROUTE."
    loading="lazy"
    decoding="async"
    width="1200"
    height="630"
  />

  <div class="fig5__captions">
    <div class="fig5__caption fig5__caption--left">
      <p class="fig5__kind">INDIVIDUAL DEFECTION</p>
      <p class="fig5__verdict">Blocked.</p>
      <p class="fig5__cite">Article 49A(1)(a)-(b), Federal Constitution.</p>
      <p class="fig5__detail">
        Inserted in 2022. Triggers a casual vacancy when an MP resigns from or
        ceases to be a member of the party they were elected under.
      </p>
    </div>

    <div class="fig5__caption fig5__caption--right">
      <p class="fig5__kind">COORDINATED PARTY-LEVEL MOVE</p>
      <p class="fig5__verdict">Left open.</p>
      <p class="fig5__cite">Article 49A does not bind the party as a corporate body.</p>
      <p class="fig5__detail">
        The structural incentive to act through a coordinated party-level move
        has therefore increased, not decreased. The resignation, dissolution,
        and expulsion routes were deliberately left open.
      </p>
    </div>
  </div>
</div>

<style>
  .fig5 {
    display: block;
    width: 100%;
  }

  .fig5__img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1200 / 630;
    background: #0f0f23;
  }

  .fig5__captions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    padding: 24px 22px 4px;
    border-top: 1px dashed rgba(155, 44, 44, 0.55);
    margin-top: 6px;
  }

  .fig5__caption {
    min-width: 0;
  }

  .fig5__kind {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: var(--accent);
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  .fig5__verdict {
    font-family: var(--font-body, var(--font-display));
    font-style: italic;
    font-size: 24px;
    color: var(--body);
    margin: 0 0 10px;
    line-height: 1.1;
  }

  .fig5__cite {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--body);
    letter-spacing: 0.02em;
    margin: 0 0 8px;
    line-height: 1.45;
  }

  .fig5__detail {
    font-family: var(--font-ui);
    font-size: 12px;
    font-style: italic;
    color: var(--muted);
    letter-spacing: 0.02em;
    margin: 0;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .fig5__captions {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>
