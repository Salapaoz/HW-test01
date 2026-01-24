const CACHE_NAME = "hw-test01-v2";
const ASSETS = [
  "/HW-test01/",
  "/HW-test01/index.html",
  "/HW-test01/style.css",
  "/HW-test01/app.js",
  "/HW-test01/manifest.json",
  "/HW-test01/icons/icon-192.png",
  "/HW-test01/icons/icon-512.png"
];

// ติดตั้ง + cache
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ลบ cache เก่า
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});
