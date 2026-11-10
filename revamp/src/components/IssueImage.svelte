<script lang="ts">
  import { BUILD_ID } from '../lib/build';

  interface Props {
    issueId: string;
    size: 'thumb' | 'card' | 'hero';
    aspectRatio?: string;
    borderRadius?: string;
    eager?: boolean;
    alt?: string;
  }
  let { issueId, size, aspectRatio = '1/1', borderRadius = '8px', eager = false, alt = '' }: Props = $props();

  // Responsive image delivery per ADR-0002 Phase 8b.
  // AVIF → WebP → JPEG, all at 640/960/1200 widths. The <img> src uses the
  // 1200w JPEG as the universal fallback (PNG is reserved for social og:image
  // meta and is not shipped to <picture>).
  const v = $derived(encodeURIComponent(BUILD_ID));
  const avifSrcset = $derived(
    `/og/issue-${issueId}-640w.avif?v=${v} 640w, ` +
    `/og/issue-${issueId}-960w.avif?v=${v} 960w, ` +
    `/og/issue-${issueId}-1200w.avif?v=${v} 1200w`
  );
  const webpSrcset = $derived(
    `/og/issue-${issueId}-640w.webp?v=${v} 640w, ` +
    `/og/issue-${issueId}-960w.webp?v=${v} 960w, ` +
    `/og/issue-${issueId}-1200w.webp?v=${v} 1200w`
  );
  const jpegSrcset = $derived(
    `/og/issue-${issueId}-640w.jpg?v=${v} 640w, ` +
    `/og/issue-${issueId}-960w.jpg?v=${v} 960w, ` +
    `/og/issue-${issueId}-1200w.jpg?v=${v} 1200w`
  );
  const fallbackSrc = $derived(`/og/issue-${issueId}-1200w.jpg?v=${v}`);

  // A missing size (a new issue whose resized art is not on file yet) used
  // to leave the browser's broken-image glyph on the lead card (audit H-7).
  // Hide the frame instead; the card reads fine without art.
  let failed = $state(false);

  // Svelte server-renders an onerror prop as the inline attribute
  // onerror="this.__e=event" so it can replay early errors after hydration.
  // The site's CSP blocks inline handlers: Firefox reports a violation for
  // each one (four per home feed load, each sent to the CSP report endpoint)
  // and the replay never runs. Listen after mount instead, and treat an image
  // that already failed before hydration the same way.
  function detectFailure(img: HTMLImageElement) {
    const fail = () => { failed = true; };
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
    img.addEventListener('error', fail);
    return { destroy: () => img.removeEventListener('error', fail) };
  }

  const sizes = $derived(
    size === 'hero' ? '(min-width: 1024px) 700px, (min-width: 768px) 50vw, 100vw'
    : size === 'card' ? '(min-width: 768px) 400px, 100vw'
    : '120px'
  );
</script>

<div class="issue-image-wrap" data-issue-image hidden={failed} style="aspect-ratio:{aspectRatio};border-radius:{borderRadius};overflow:hidden;background:var(--bg-sunken);{failed ? 'display:none;' : ''}">
  <picture>
    <source type="image/avif" srcset={avifSrcset} sizes={sizes} />
    <source type="image/webp" srcset={webpSrcset} sizes={sizes} />
    <img
      src={fallbackSrc}
      srcset={jpegSrcset}
      sizes={sizes}
      alt={alt}
      width="1200"
      height="630"
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      fetchpriority={eager ? 'high' : undefined}
      style="width:100%;height:100%;object-fit:cover;display:block;"
      use:detectFailure
    />
  </picture>
</div>
