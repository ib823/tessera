<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, removeNotification, clearAll, type NotificationItem } from '../stores/notifications';

  const VAPID_PUBLIC_KEY = 'BM2IpaheS2aS1-Fs6_EBmsWuSUZ09aYkndax5C9XKTd0qJzKUKRz1cYFb78yjtM8d_sEf0koC2wrUbOTSaY7GK4';
  const NOTIFY_API = 'https://tfa-notify.4thangle.workers.dev';

  let open = $state(false);
  let items = $state<NotificationItem[]>([]);
  let unread = $state(0);
  let triggerEl: HTMLButtonElement | undefined = $state(undefined);
  let panelEl: HTMLDivElement | undefined = $state(undefined);

  // Push subscription state
  let pushSupported = $state(false);
  let pushSubscribed = $state(false);
  let pushDenied = $state(false);
  let pushLoading = $state(false);
  let pushError = $state('');
  const panelId = 'notifications-panel';

  // Cleanup references
  let swListener: ((e: MessageEvent) => void) | null = null;
  let visListener: (() => void) | null = null;

  onMount(() => {
    refresh();
    checkPushStatus();

    // Listen for new notifications from Service Worker
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      swListener = (e: MessageEvent) => {
        if (e.data?.type === 'NOTIFICATION_RECEIVED') refresh();
      };
      navigator.serviceWorker.addEventListener('message', swListener);
    }

    // Refresh on focus
    visListener = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', visListener);
  });

  onDestroy(() => {
    if (swListener && 'serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', swListener);
    }
    if (visListener) {
      document.removeEventListener('visibilitychange', visListener);
    }
  });

  function checkPushStatus() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      pushSupported = false;
      return;
    }
    // iOS Safari (non-PWA) doesn't support Web Push
    // iOS PWA (standalone mode) supports Web Push since Safari 16.4+
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) { pushSupported = false; return; }

    pushSupported = true;
    if (Notification.permission === 'denied') { pushDenied = true; return; }
    if (Notification.permission === 'granted' || localStorage.getItem('tfa:v1:push-subscribed') === 'true') {
      pushSubscribed = true;
    }
  }

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const arr = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
    return arr;
  }

  async function subscribePush() {
    if (pushLoading) return;
    pushLoading = true;
    pushError = '';
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') { pushDenied = true; pushLoading = false; return; }
      if (permission !== 'granted') { pushLoading = false; return; }

      const reg = await navigator.serviceWorker.ready;
      if (!reg.pushManager) { pushSupported = false; pushLoading = false; return; }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const resp = await fetch(NOTIFY_API + '/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!resp.ok) throw new Error('Subscribe failed');

      pushSubscribed = true;
      try {
        localStorage.setItem('tfa:v1:push-subscribed', 'true');
        localStorage.setItem('tfa:v1:push-endpoint', subscription.endpoint);
      } catch {}
    } catch {
      pushError = 'Could not enable alerts. Please try again.';
    }
    pushLoading = false;
  }

  async function unsubscribePush() {
    if (pushLoading) return;
    pushLoading = true;
    pushError = '';
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Notify server
        await fetch(NOTIFY_API + '/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        }).catch(() => {});
      }

      pushSubscribed = false;
      try {
        localStorage.removeItem('tfa:v1:push-subscribed');
        localStorage.removeItem('tfa:v1:push-endpoint');
      } catch {}
    } catch {
      pushError = 'Could not turn off alerts. Please try again.';
    }
    pushLoading = false;
  }

  function refresh() {
    items = getNotifications();
    unread = getUnreadCount();
  }

  function toggle() {
    open = !open;
    if (open) {
      requestAnimationFrame(() => {
        const firstAction = panelEl?.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
        (firstAction ?? panelEl)?.focus();
      });
    }
  }

  function close() {
    open = false;
    requestAnimationFrame(() => triggerEl?.focus());
  }

  function handleItemClick(item: NotificationItem) {
    markAsRead(item.id);
    open = false;
    refresh();
    if (item.url) {
      // Extract issue ID from URL and use SPA navigation
      const issueMatch = item.url.match(/\/issue\/(\w+)/);
      if (issueMatch) {
        // Dispatch custom event so App.svelte can open the issue in-app
        window.dispatchEvent(new CustomEvent('t4a-open-issue', { detail: { issueId: issueMatch[1] } }));
      } else {
        window.location.href = item.url;
      }
    }
  }

  function handleRemoveItem(e: MouseEvent, item: NotificationItem) {
    e.stopPropagation();
    removeNotification(item.id);
    refresh();
  }

  function handleMarkAllRead() {
    markAllAsRead();
    refresh();
  }

  function handleClearAll() {
    clearAll();
    refresh();
  }

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={open ? onKeyDown : undefined} />

<div style="position:relative;">
  <button
    bind:this={triggerEl}
    onclick={toggle}
    style="background:{open ? 'var(--bg-sunken, #F1F3F5)' : 'none'};border:none;cursor:pointer;padding:8px;min-height:44px;min-width:44px;display:flex;align-items:center;justify-content:center;position:relative;border-radius: var(--radius-md);transition:background 0.2s ease-out;"
    aria-label={unread > 0 ? `Alerts: ${unread} unread notifications` : 'Alerts'}
    aria-controls={panelId}
    aria-haspopup="dialog"
    aria-expanded={open}
  >
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill={open ? 'var(--text-primary, #212529)' : 'none'} stroke={open ? 'var(--text-primary, #212529)' : 'var(--text-tertiary, #6C757D)'} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:fill 0.2s ease-out,stroke 0.2s ease-out;">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    {#if unread > 0}
      <span style="position:absolute;top:4px;right:4px;width:16px;height:16px;background:var(--score-critical, #E03131);color:#fff;font-family:var(--font-display, sans-serif);font-size: var(--text-micro);font-weight:700;border-radius: var(--radius-round);display:flex;align-items:center;justify-content:center;line-height:1;">{unread > 9 ? '9+' : unread}</span>
    {/if}
  </button>

  {#if open}
    <button
      type="button"
      class="notifications-backdrop"
      onclick={close}
      aria-label="Close notifications panel"
    ></button>
    <div bind:this={panelEl} id={panelId} role="dialog" aria-modal="false" aria-label="Alerts" tabindex="-1" style="position:fixed;top:64px;right:8px;width:min(380px, calc(100vw - 16px));max-height:calc(100dvh - 88px);overflow-y:auto;background:var(--bg, #fff);border:1px solid var(--border-subtle, #E9ECEF);border-radius: var(--radius-lg);box-shadow:var(--shadow-lg, 0 8px 30px rgba(0,0,0,0.08));z-index:var(--z-modal, 2000);margin-top:4px;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border-subtle, #E9ECEF);">
        <span style="font-family:var(--font-display, sans-serif);font-size: var(--text-body);font-weight:700;color:var(--text-primary, #212529);">Alerts</span>
        <div style="display:flex;align-items:center;gap:4px;">
          {#if unread > 0}
            <button onclick={handleMarkAllRead} style="background:none;border:none;cursor:pointer;font-family:var(--font-body, sans-serif);font-size: var(--text-sm);color:var(--focus, #1971C2);padding:8px;min-height:44px;display:flex;align-items:center;">Mark all read</button>
          {/if}
          {#if items.length > 0}
            <button onclick={handleClearAll} style="background:none;border:none;cursor:pointer;font-family:var(--font-body, sans-serif);font-size: var(--text-sm);color:var(--text-muted, #868E96);padding:8px;min-height:44px;display:flex;align-items:center;">Clear all</button>
          {/if}
        </div>
      </div>

      {#if items.length === 0}
        <p class="alerts-empty">No alerts yet. New issue alerts will appear here.</p>
      {:else}
        {#each items.slice(0, 20) as item}
          <div
            class="notification-row"
            style="background:{item.read ? 'var(--bg, #fff)' : 'var(--bg-elevated, #F8F9FA)'};border-bottom:1px solid var(--border-light, rgba(0,0,0,0.05));"
          >
            <button
              type="button"
              onclick={() => handleItemClick(item)}
              style="flex:1;min-width:0;text-align:left;background:none;border:none;padding:12px 0 12px 16px;cursor:pointer;display:flex;flex-direction:column;gap:4px;transition:background 0.2s ease-out;min-height:44px;"
            >
              <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                {#if !item.read}
                  <div style="width:6px;height:6px;border-radius: var(--radius-round);background:var(--score-info, #1971C2);flex-shrink:0;"></div>
                {/if}
                <span style="font-family:var(--font-display, sans-serif);font-size: var(--text-ui);font-weight:{item.read ? '600' : '700'};color:var(--text-primary, #212529);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;">{item.title}</span>
                <span style="font-family:var(--font-body, sans-serif);font-size: var(--text-xs);color:var(--text-muted, #868E96);flex-shrink:0;">{timeAgo(item.timestamp)}</span>
              </div>
              <p style="font-family:var(--font-body, sans-serif);font-size: var(--text-sm);color:var(--text-tertiary, #5C636A);margin:0;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;{!item.read ? 'padding-left:14px;' : ''}">{item.body}</p>
            </button>
            <button
              type="button"
              onclick={(e) => handleRemoveItem(e, item)}
              style="flex-shrink:0;padding:0;width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:var(--text-muted, #868E96);font-size: var(--text-body);line-height:1;"
              aria-label="Remove notification"
            >&times;</button>
          </div>
        {/each}
      {/if}

      <section class="alerts-settings" aria-label="Push preferences">
        <div class="alerts-switch-row"><label for="fora-push-switch">New issue alerts</label><button id="fora-push-switch" role="switch" aria-checked={pushSubscribed} aria-label="New issue alerts" disabled={!pushSupported || pushDenied || pushLoading} onclick={() => pushSubscribed ? unsubscribePush() : subscribePush()} class="alerts-switch"><span aria-hidden="true">{pushLoading ? '…' : pushSubscribed ? 'On' : 'Off'}</span></button></div>
        <p>Up to 3 a week, on Tuesday, Thursday and Saturday.</p>
        <p class="alerts-permission">{!pushSupported ? 'Push alerts are unavailable in this browser. On iPhone or iPad, add the site to your Home Screen first.' : pushDenied ? 'Notifications blocked. Enable in browser settings.' : pushSubscribed ? 'Notifications on. You can turn them off here at any time.' : 'Notifications off. Turning them on asks your browser for permission.'}</p>
        {#if pushError}<p role="alert">{pushError}</p>{/if}
      </section>
    </div>
  {/if}
</div>

<style>
  .notifications-backdrop {
    position: fixed;
    inset: 0;
    /* Just below the z-modal panel so clicks on the backdrop close it. */
    z-index: calc(var(--z-modal, 2000) - 1);
    border: 0;
    background: transparent;
    padding: 0;
    cursor: default;
  }

  .notification-row {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  .alerts-empty { padding:24px 20px; margin:0; font:.9375rem/1.6 var(--fora-sans); color:var(--fora-muted); }
  .alerts-settings { border-top:1px solid var(--fora-rule); padding:20px; background:var(--fora-paper); }
  .alerts-settings p { font:.8125rem/1.6 var(--fora-sans); color:var(--fora-muted); margin:12px 0 0; }
  .alerts-switch-row { display:flex; justify-content:space-between; gap:16px; align-items:center; font:600 .9375rem var(--fora-sans); }
  .alerts-switch { min-width:64px; min-height:44px; background:var(--fora-surface); color:var(--fora-ink); border:1px solid var(--fora-control-edge); border-radius:24px; cursor:pointer; font:600 .875rem var(--fora-sans); }
  .alerts-switch[aria-checked='true'] { background:var(--fora-brand-tint); color:var(--fora-brand); border-color:var(--fora-brand); }
  .alerts-switch:disabled { cursor:default; opacity:.65; }
</style>
