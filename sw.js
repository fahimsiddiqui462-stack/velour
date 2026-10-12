/* VELOUR service worker — offline shell + runtime caching */
const VERSION = "velour-v1.0.0";
const SHELL = [
  "./", "index.html", "shop.html", "product.html", "cart.html", "checkout.html",
  "order.html", "account.html", "wishlist.html", "journal.html", "about.html",
  "contact.html", "login.html", "register.html", "size-guide.html", "shipping.html",
  "repairs.html", "privacy.html", "terms.html", "cookies.html", "careers.html", "404.html",
  "assets/css/styles.css", "assets/js/data.js", "assets/js/app.js",
  "assets/js/stylist.js", "assets/js/features.js", "assets/js/pwa.js",
  "assets/img/favicon.svg", "assets/img/icon-192.png", "assets/img/icon-512.png",
  "manifest.webmanifest"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // let CDN images go to network

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
