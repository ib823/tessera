<script lang="ts">
  import MobileCard from './MobileCard.svelte';
  import type { IssueSummary } from '../lib/issues-loader';
  import type { ReadState } from '../stores/reader';
  interface Props {
    issue: IssueSummary;
    index: number;
    readState: ReadState | null;
    onOpen: () => void;
    onPrefetch?: () => void;
    hasConnections?: boolean;
  }
  let { issue, index, readState, onOpen, onPrefetch, hasConnections = false }: Props = $props();
</script>
<div class="desktop-card"><MobileCard {issue} {readState} {onOpen} {onPrefetch} {hasConnections} eager={index < 3}/></div>
<style>.desktop-card { min-width:0; }</style>
