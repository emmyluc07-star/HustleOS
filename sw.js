const CACHE_NAME = 'hustleos-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './android-icon-192x192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});