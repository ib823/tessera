<!--
  DossierTimeline.svelte
  ---------------------------------------------------------------
  Renders `t: 'timeline'` sections.

  This IS the rendering of fig-1 (the launches-timeline). The
  events list lives inline in the section payload, not in the
  figures array, so the timeline body and the data agree by
  construction — no chance of caption/data drift.

  On desktop: events are stacked rows with year + marker + label.
  Markers are colour-coded by outcome (filled / outline / faded).
  On mobile: identical, just narrower columns.

  Outcome mapping is keyword-based on the outcome string so the
  data file stays prose-friendly. If you need a strict enum later,
  add an explicit `outcomeClass` field to DossierTimelineEvent.
-->
<script lang="ts">
  import type { DossierTimelineSection, DossierTimelineEvent } from '../data/dossier-types';

  interface Props {
    section: DossierTimelineSection;
    n?: number;
  }

  let { section, n }: Props = $props();

  function markerClass(ev: DossierTimelineEvent): string {
    const o = ev.outcome.toLowerCase();
    if (o.startsWith('failed') || o.includes('zero seats') || o.includes('wiped out')) {
      return 'timeline__marker timeline__marker--failed';
    }
    if (o.startsWith('partial') || o.includes('reabsorbed')) {
      return 'timeline__marker timeline__marker--partial';
    }
    return 'timeline__marker';
  }
</script>

<section
  class="section timeline-section"
  id={section.id}
  data-section-type="timeline"
  aria-labelledby="{section.id}-title"
>
  {#if n != null}
    <div class="section__num" aria-hidden="true">{String(n).padStart(2, '0')}</div>
  {/if}
  <p class="section__kind">{section.figure ? `Figure ${section.figure.replace('fig-', '')} · Timeline` : 'Timeline'}</p>
  <h2 class="section__title" id="{section.id}-title">{section.title}</h2>

  {#if section.intro}
    <p class="timeline__intro">{section.intro}</p>
  {/if}

  <ol class="timeline__events">
    {#each section.events as ev}
      <li class="timeline__event">
        <span class="timeline__year">{ev.year}</span>
        <span class={markerClass(ev)} aria-hidden="true"></span>
        <div>
          <span class="timeline__label">{ev.label}</span>
          {#if ev.founder && ev.founder !== '—'}
            <div class="timeline__founder">{ev.founder}</div>
          {/if}
          <div class="timeline__outcome">{ev.outcome}</div>
        </div>
      </li>
    {/each}
  </ol>

  <p class="figure__source">
    Filled marker — successful pivot. Outline — partial / reabsorbed. Faded — failed launch.
    Source: ROS gazette records, EC results, T4A compilation.
  </p>
</section>
