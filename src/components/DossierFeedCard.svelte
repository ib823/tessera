<!--
  DossierFeedCard.svelte
  ---------------------------------------------------------------
  Homepage feed entry for a dossier.

  Visual marks (per Q3/Q4 in the design brief):
  • 5px burgundy edge bar on the left of the card
  • "DOSSIER" pill badge in the top-right (burgundy bg, warm-white)
  • Spectral italic title in the cover font
  • Subtitle + read-time meta in Inter
  • Optional series ordinal (e.g. "Series 1 · Dossier 1")

  Soft-launch flag: this component renders only when
  src/data/dossiers.ts SHOW_DOSSIERS_IN_FEED is true (caller checks).

  Integration into the existing FeedRow.svelte
  -------------------------------------------
  Splice this in by `kind` — see the FeedRow PATCH below in this
  same file as a JS-style comment. Drop the patch into wherever
  FeedRow.svelte branches on entry kind today. Do NOT alter the
  rendering of regular `Issue` entries.
-->
<script lang="ts">
  import type { DossierFeedEntry } from '../data/dossiers';

  interface Props {
    entry: DossierFeedEntry;
  }

  let { entry }: Props = $props();

  let dateLabel = $derived(
    new Date(entry.sourceDate).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  );
</script>

<a class="dossier-card" href={entry.href} data-feed-kind="dossier">
  <span class="dossier-card__edge" aria-hidden="true"></span>

  <div class="dossier-card__body">
    <div class="dossier-card__top">
      <span class="dossier-card__series">
        Series {entry.series.ordinal} · {entry.series.name}
      </span>
      <span class="dossier-card__pill">Dossier · {entry.id}</span>
    </div>

    <h3 class="dossier-card__title">{entry.title}</h3>
    <p class="dossier-card__subtitle">{entry.subtitle}</p>

    <div class="dossier-card__meta">
      <span>Est. {entry.estReadMinutes} min read</span>
      <span class="dot" aria-hidden="true">·</span>
      <span>{entry.primaryLens}</span>
      <span class="dot" aria-hidden="true">·</span>
      <span>{dateLabel}</span>
    </div>
  </div>
</a>

<style>
  .dossier-card {
    position: relative;
    display: grid;
    grid-template-columns: 5px 1fr;
    background: #15152e;
    border: 1px solid rgba(244, 241, 235, 0.06);
    border-left: 0;
    border-radius: 2px;
    text-decoration: none;
    color: inherit;
    transition: border-color 160ms, transform 160ms;
    overflow: hidden;
  }
  .dossier-card:hover { border-color: rgba(155, 44, 44, 0.45); }
  .dossier-card:hover .dossier-card__title { color: #9B2C2C; }

  .dossier-card__edge {
    background: #9B2C2C;
    width: 5px;
  }

  .dossier-card__body { padding: 22px 26px 22px 24px; }

  .dossier-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .dossier-card__series {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9CA3AF;
  }

  .dossier-card__pill {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #F4F1EB;
    background: #9B2C2C;
    padding: 4px 10px;
    border-radius: 2px;
    white-space: nowrap;
  }

  .dossier-card__title {
    font-family: 'Spectral', 'Source Serif Pro', Georgia, serif;
    font-style: italic;
    font-weight: 300;
    font-size: 26px;
    line-height: 1.18;
    margin: 0 0 10px;
    color: #F4F1EB;
    letter-spacing: -0.01em;
    transition: color 160ms;
    text-wrap: balance;
  }

  .dossier-card__subtitle {
    font-family: 'Spectral', 'Source Serif Pro', Georgia, serif;
    font-size: 16px;
    font-weight: 300;
    line-height: 1.5;
    color: #F4F1EB;
    margin: 0 0 16px;
    opacity: 0.85;
    text-wrap: pretty;
  }

  .dossier-card__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 12px;
    color: #9CA3AF;
    letter-spacing: 0.03em;
  }
  .dossier-card__meta .dot { color: #3F1212; }

  @media (max-width: 560px) {
    .dossier-card__body { padding: 18px 18px 18px 16px; }
    .dossier-card__top { margin-bottom: 14px; }
    .dossier-card__title { font-size: 22px; }
    .dossier-card__subtitle { font-size: 15px; }
  }
</style>

<!--
  ================================================================
  PATCH for src/components/FeedRow.svelte (manual splice required)
  ================================================================
  We don't ship the full FeedRow body because we don't have the
  current shape of `entry` in your repo. Locate the branch in
  FeedRow that decides which card to render and add the `dossier`
  case BEFORE the default issue card:

      <script lang="ts">
        import type { Issue } from '../data/issue-types';
        import type { DossierFeedEntry } from '../data/dossiers';
        import DossierFeedCard from './DossierFeedCard.svelte';

        interface Props {
          entry: Issue | DossierFeedEntry;
        }
        let { entry }: Props = $props();
      </script>

      {#if 'kind' in entry && entry.kind === 'dossier'}
        <DossierFeedCard entry={entry} />
      {:else}
        <!-- existing IssueFeedCard / inline issue markup -->
      {/if}

  And in the homepage loader that builds the feed, merge dossier
  entries with issues so they appear inline by sourceDate:

      import { getIssuesForFeed } from '../data/issues';
      import { getDossierFeedEntries } from '../data/dossiers';

      const entries = [
        ...getIssuesForFeed(),
        ...getDossierFeedEntries(), // [] when SHOW_DOSSIERS_IN_FEED=false
      ].sort((a, b) => Date.parse(b.sourceDate) - Date.parse(a.sourceDate));

  Soft-launch is the default — getDossierFeedEntries() returns []
  until SHOW_DOSSIERS_IN_FEED is flipped to true in dossiers.ts.
  ================================================================
-->
