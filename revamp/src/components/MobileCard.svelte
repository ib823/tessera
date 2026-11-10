<script lang="ts">
  import IssueRow from './IssueRow.svelte';
  import { inAppClick, issueHref } from '../lib/link-open';
  import type { IssueSummary } from '../lib/issues-loader';
  import type { ReadState } from '../stores/reader';
  interface Props { issue:IssueSummary; readState:ReadState|null; onOpen:()=>void; onPrefetch?:()=>void; hasConnections?:boolean; eager?:boolean; }
  let { issue, readState, onOpen, onPrefetch, hasConnections=false, eager=false }:Props=$props();
</script>
<!-- Saved, Search and the phone and tablet feeds: the shared IssueRow with its art. -->
<article class="mobile-card">
  <a class="card-link" href={issueHref(issue.id)} onclick={inAppClick(onOpen)} onpointerenter={() => onPrefetch?.()} onfocus={() => onPrefetch?.()}>
    <IssueRow {issue} {readState} density="regular" art={true} {eager} headingTag="h2" {hasConnections} />
  </a>
</article>
<style>
  .mobile-card { position:relative; border-bottom:1px solid var(--fora-rule); padding:24px 0; }
  .card-link { display:block; color:inherit; text-decoration:none; }
</style>
