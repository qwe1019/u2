const CACHE_NAME = 'u2-diet-calendar-pwa-v2';
const BASE_URL = new URL('./', self.location.href);
const appShell = new URL('figma-import.html', BASE_URL).toString();
const ASSETS = [
  appShell,
  new URL('manifest.webmanifest', BASE_URL).toString(),
  new URL('apple-touch-icon.png', BASE_URL).toString(),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key))))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(appShell));
    })
  );
});
