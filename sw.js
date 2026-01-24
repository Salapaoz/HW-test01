const CACHE_NAME = "hw-v1";
const ASSETS = [
  "/HW-test01/",
  "/HW-test01/index.html",
  "/HW-test01/style.css",
  "/HW-test01/app.js",
  "/HW-test01/manifest.json",
  "/HW-test01/icons/icon-192.png",
  "/HW-test01/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});

