<!--
  DossierProgress.svelte
  ---------------------------------------------------------------
  Sticky top bar with:
  • T4A brand + DOSSIER pill + title (truncated on small screens)
  • Section number / total
  • Share + Print actions (desktop)
  • TOC trigger (mobile only — desktop has the left-rail TOC)
  • A 2px burgundy progress fill at the bottom of the bar

  Progress is read-only: the parent reader passes `progress` (0–1)
  and `sectionIndex` / `sectionTotal`. Scroll listening is done in
  DossierReader so this component stays a dumb render.

  Share button copies the canonical URL to clipboard. No web-share
  invocation by default — that fires native share on Safari/iOS,
  which is a different UX than the desktop "copy link" affordance.
  If you want native share on mobile, gate `navigator.share` here.
-->
<script lang="ts">
  interface Props {
    title: string;
    dossierId: string;
    sectionIndex: number; // 1-indexed for display
    sectionTotal: number;
    progress: number; // 0..1
    onToggleToc?: () => void;
    onShare?: () => void;
  }

  let {
    title,
    dossierId,
    sectionIndex,
    sectionTotal,
    progress,
    onToggleToc,
    onShare,
  }: Props = $props();

  let shared = $state(false);
  let shareTimer: ReturnType<typeof setTimeout> | null = null;

  async function handleShare() {
    onShare?.();
    try {
      await navigator.clipboard.writeText(window.location.href);
      shared = true;
      if (shareTimer) clearTimeout(shareTimer);
      shareTimer = setTimeout(() => (shared = false), 1600);
    } catch {
      /* clipboard refused — silent; the user will hear no feedback. */
    }
  }

  function handlePrint() {
    window.print();
  }
</script>

<header class="progress-bar" role="banner">
  <div class="progress-bar__inner">
    <a href="/" class="progress-bar__brand" aria-label="The Fourth Angle home">
      <span class="progress-bar__brand-text">T4A</span>
      <span class="progress-bar__brand-dossier">Dossier · {dossierId}</span>
    </a>

    <div class="progress-bar__title">
      <strong>{title}</strong>
    </div>

    <div class="progress-bar__section-count" aria-live="polite">
      <strong>{String(sectionIndex).padStart(2, '0')}</strong>
      <span> / {String(sectionTotal).padStart(2, '0')}</span>
    </div>

    <div class="progress-bar__actions">
      <button
        type="button"
        class="progress-bar__btn progress-bar__btn--share"
        onclick={handleShare}
        aria-label="Copy link to this dossier"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4">
          <circle cx="4" cy="8" r="2" />
          <circle cx="12" cy="3.5" r="2" />
          <circle cx="12" cy="12.5" r="2" />
          <path d="M5.7 7 10.5 4.4" />
          <path d="M5.7 9 10.5 11.6" />
        </svg>
        <span>{shared ? 'Copied' : 'Share'}</span>
      </button>

      <button
        type="button"
        class="progress-bar__btn"
        onclick={handlePrint}
        aria-label="Print or save as PDF"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M4 5V2h8v3" />
          <rect x="2.5" y="5" width="11" height="6" rx="0.5" />
          <rect x="4" y="9" width="8" height="5" />
        </svg>
        <span>Print</span>
      </button>

      <button
        type="button"
        class="progress-bar__btn progress-bar__btn--toc"
        onclick={onToggleToc}
        aria-label="Open table of contents"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4">
          <line x1="3" y1="4" x2="13" y2="4" />
          <line x1="3" y1="8" x2="13" y2="8" />
          <line x1="3" y1="12" x2="13" y2="12" />
        </svg>
        <span>Contents</span>
      </button>
    </div>
  </div>

  <div
    class="progress-bar__fill"
    style:width="{Math.max(0, Math.min(1, progress)) * 100}%"
    aria-hidden="true"
  ></div>
</header>
