/* Peace Baptist Church — service worker (PWA + web push) */

function resolveNotificationUrl(raw) {
  const trimmed = String(raw || '/').trim();
  if (!trimmed) return `${self.location.origin}/`;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed.replace(/\s+/g, '')).href;
    }
    return new URL(trimmed, self.location.origin).href;
  } catch {
    return `${self.location.origin}/`;
  }
}

self.addEventListener('push', (event) => {
  let payload = { title: 'Peace Baptist Church', body: '', url: '/' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  const targetUrl = resolveNotificationUrl(payload.url);
  const icon = payload.icon || '/images/church-exterior.jpg';
  const badge = payload.badge || icon;

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon,
      badge,
      tag: payload.tag || 'peace-baptist',
      data: { url: targetUrl },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = resolveNotificationUrl(event.notification.data?.url);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            return client.navigate(targetUrl).then(() => client.focus());
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});