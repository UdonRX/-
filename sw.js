// アプリ更新時はバージョン（v1, v2, v3...）を更新してください
const CACHE_NAME = 'pwa-dashboard-v16';

// キャッシュ対象の静的ファイル
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/summary.png'
];

// インストール処理：ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // 新しい ServiceWorker をすぐに有効化
      return self.skipWaiting();
    })
  );
});

// アクティベート処理：古いキャッシュを削除してクライアントを即時制御
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 現在の CACHE_NAME 以外の古いキャッシュを削除
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 制御下のページ（表示中のタブ）を即座に更新されたSWの制御下に置く
      return self.clients.claim();
    })
  );
});

// フェッチ処理：API通信（Open-MeteoやCORSプロキシ等）はネットワークから取得し、エラー時は安全に処理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 外部APIやCORSプロキシ、RSS関連はキャッシュせず常に最新を取得（通信失敗時もエラーをキャッチする）
  if (
    url.origin !== location.origin ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('open-meteo.com') ||
    url.hostname.includes('corsproxy.io') ||
    url.hostname.includes('allorigins.win') ||
    url.hostname.includes('rss2json.com')
  ) {
    event.respondWith(
      fetch(event.request).catch((err) => {
        // 通信失敗時にService Worker全体がクラッシュするのを防ぐ
        console.warn('Service Worker 外部リクエスト通信エラー:', event.request.url);
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // 静的ファイル：ネットワークを優先し、オフライン時はキャッシュから返す（Network First）
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 取得できたらキャッシュを更新
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // オフラインなど通信失敗時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});
