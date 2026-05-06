const CACHE = 'truckboy-v1';

const STATIC = [
  './icon-192.png',
  './icon-512.png',
  './icon-1024.png',
  './manifest.json',
];

const PAGES = [
  './拍攝總表.html',
  './day1.html',
  './day2.html',
  './day3.html',
  './day4.html',
  './day5.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([...PAGES, ...STATIC]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const isPage = PAGES.some(p => req.url.includes(p.replace('./', ''))) || req.url.endsWith('.html');

  if (isPage) {
    // HTML：有網路先抓新版並更新快取，沒網路才用快取
    e.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    // 圖片/字型等靜態資源：快取優先
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return res;
      }))
    );
  }
});
