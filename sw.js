const CACHE_NAME = "hw-v2";

const ASSETS = [
  "/HW-test01/",
  "/HW-test01/index.html",
  "/HW-test01/style.css",
  "/HW-test01/app.js",
  "/HW-test01/manifest.json",
  "/HW-test01/icon-192.png",
  "/HW-test01/icon-512.png"
];

// install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// activate
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
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
