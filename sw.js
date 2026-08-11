/* おむかえルート帖 LINE版 */
/* 注意：キャッシュはオリジン単位で共有されます（github.io は全リポジトリで同一オリジン）。
   自分の接頭辞が付いたものだけを消すようにして、他のアプリのキャッシュを巻き添えにしません。 */
const PREFIX = 'omukae-line-';
const CACHE = PREFIX + 'v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  /* 学校データは本番リポジトリと共用しているため、こちらではキャッシュしません */
  if (url.pathname.indexOf('/omukae-route/data/') !== -1) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && url.origin === location.origin && url.pathname.indexOf('/omukae-route-line/') !== -1) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
