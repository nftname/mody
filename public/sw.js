// Service Worker للسماح بتثبيت التطبيق كـ PWA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nnm-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.png',
        '/favicon.ico'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
