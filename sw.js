const CACHE_NAME = 'dashboard-pwa-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // APIエンドポイント (/api/rss) や 外部API はキャッシュせず常にネットワークから取得
  if (url.pathname.startsWith('/api/') || url.origin !== location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});