const CACHE_NAME = "hw-final-v1";

const ASSETS = [
  "/HW-test01/",
  "/HW-test01/index.html",
  "/HW-test01/style.css",
  "/HW-test01/app.js",
  "/HW-test01/manifest.json",
  "/HW-test01/icon-192.png",
  "/HW-test01/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
