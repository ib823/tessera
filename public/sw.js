const CACHE_NAME = 'tfa-static-v13';
const PRECACHE = ['/offline.html', '/icons/icon-192.png', '/icons/badge-96.png'];

function freshRequest(request) {
  return new Request(request, { cache: 'no-store' });
}

// Cloudflare Pages answers /offline.html with a 308 to /offline, so the
// precached copy is a redirected response. Browsers refuse a redirected
// response as the answer to a navigation, and offline readers saw the
// browser's own error page instead. Serve a plain copy (same body, status
// and headers, CSP included).
function plainResponse(response) {
  if (!response || !response.redirected) return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

function isMutablePath(pathname) {
  return pathname === '/' ||
    pathname.endsWith('.html') ||
    pathname === '/manifest.json' ||
    pathname === '/issues-feed.json' ||
    pathname === '/fact-graph.json' ||
    pathname === '/search-index.json' ||
    pathname === '/signatures.json' ||
    pathname === '/verify.html' ||
    pathname.startsWith('/issues/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate' || isMutablePath(url.pathname)) {
    event.respondWith(
      fetch(freshRequest(event.request)).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html').then(plainResponse);
        }
        return Response.error();
      })
    );
    return;
  }

  // Hashed assets (_a/): cache forever (immutable by hash)
  if (url.pathname.startsWith('/_a/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Fonts: cache-first (they don't change)
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ── Push Notifications ──

const NOTIFY_API = 'https://tfa-notify.4thangle.workers.dev';

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/badge-96.png',
      image: data.image,
      tag: data.tag || 'tfa-default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: false,
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'The Fourth Angle', options).then(() => {
        // Notify all open clients to update their notification inbox
        return clients.matchAll({ type: 'window' }).then((windowClients) => {
          windowClients.forEach((client) => {
            client.postMessage({
              type: 'NOTIFICATION_RECEIVED',
              title: data.title,
              body: data.body,
              issueId: data.data?.url?.match(/issue\/(\w+)/)?.[1] || '',
              url: data.data?.url || '/',
              timestamp: Date.now(),
            });
          });
        });
      })
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('The Fourth Angle', {
        body: event.data.text(),
        icon: '/icons/icon-192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') return;

  // Validate URL — only allow same-origin links (prevent XSS)
  var targetUrl = self.location.origin;
  if (data.url) {
    try {
      var parsed = new URL(data.url, self.location.origin);
      if (parsed.origin === new URL(self.location.origin).origin) {
        targetUrl = parsed.href;
      }
    } catch (e) {}
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it and navigate in-app
      for (const client of windowClients) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TO', url: data.url || '/' });
          return client.focus();
        }
      }
      // No open tab — open new window
      return clients.openWindow(targetUrl);
    })
  );
});

// Heartbeat: update lastSeen on the notification server
// Clear notifications when app becomes visible
// Clear specific notification when its issue is opened
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'HEARTBEAT') {
    const endpoint = event.data.endpoint;
    if (endpoint) {
      fetch(NOTIFY_API + '/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          // The server drops subscriptions 90 days after the reader was last seen.
          // If this browser still holds the same push subscription, register it again.
          if (!data || data.found !== false) return;
          return self.registration.pushManager.getSubscription().then((sub) => {
            if (!sub || sub.endpoint !== endpoint) return;
            return fetch(NOTIFY_API + '/api/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sub.toJSON()),
            });
          });
        })
        .catch(() => {});
    }
  }

  if (event.data.type === 'APP_VISIBLE') {
    // Clear all T4A notifications and the badge when the app is opened
    event.waitUntil(clearShownNotifications());
  }

  if (event.data.type === 'ISSUE_OPENED') {
    var issueId = event.data.issueId;
    if (!issueId) return;
    // Clear only the exact notification for this issue (not partial matches)
    self.registration.getNotifications().then(function(notifications) {
      notifications.forEach(function(n) {
        if (n.data && n.data.url && (
          n.data.url === '/issue/' + issueId ||
          n.data.url.startsWith('/issue/' + issueId + '?')
        )) {
          n.close();
        }
      });
    });
  }
});

// ── Notification clearing ──

// False only when the worker can read the notification permission and it is
// not granted. Without it this origin cannot have shown a notification, and
// the app sets no badge of its own, so there is nothing to clear.
function mayHaveNotifications() {
  if (typeof Notification === 'undefined' || typeof Notification.permission !== 'string') return true;
  return Notification.permission === 'granted';
}

// Closes every notification this origin is showing and clears the app badge.
//
// The permission check also keeps the Badging API away from browsers that
// expose it in service workers but cannot serve it there. chrome-headless-shell
// (Playwright's default headless Chromium) has no handler for it in the worker
// scope, so calling navigator.clearAppBadge() from here makes the browser kill
// the renderer process, and with it every page of this origin ("No binder found
// for interface blink.mojom.BadgeService for the service worker scope").
// Feature detection cannot see that and .catch() cannot catch it. The shell
// always reports notification permission as denied, so the check skips the call
// there, while an installed app with permission still gets its badge cleared.
function clearShownNotifications() {
  if (!mayHaveNotifications()) return Promise.resolve();
  const steps = [];
  if (typeof self.registration.getNotifications === 'function') {
    steps.push(self.registration.getNotifications().then((list) => list.forEach((n) => n.close())));
  }
  if (typeof navigator.clearAppBadge === 'function') {
    steps.push(navigator.clearAppBadge());
  }
  return Promise.all(steps.map((step) => step.catch(() => {})));
}
