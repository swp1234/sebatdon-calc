const CACHE_NAME = 'sebatdon-calc-v1';
const ASSETS = [
  '/sebatdon-calc/',
  '/sebatdon-calc/index.html',
  '/sebatdon-calc/css/style.css',
  '/sebatdon-calc/js/app.js',
  '/sebatdon-calc/js/i18n.js',
  '/sebatdon-calc/js/locales/ko.json',
  '/sebatdon-calc/js/locales/en.json',
  '/sebatdon-calc/js/locales/ja.json',
  '/sebatdon-calc/js/locales/zh.json',
  '/sebatdon-calc/js/locales/hi.json',
  '/sebatdon-calc/js/locales/ru.json',
  '/sebatdon-calc/js/locales/es.json',
  '/sebatdon-calc/js/locales/pt.json',
  '/sebatdon-calc/js/locales/id.json',
  '/sebatdon-calc/js/locales/tr.json',
  '/sebatdon-calc/js/locales/de.json',
  '/sebatdon-calc/js/locales/fr.json',
  '/sebatdon-calc/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
