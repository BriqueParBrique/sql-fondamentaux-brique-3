---
layout: null
# Managed by BriqueParBrique/nouvelle-brique — do not edit in brick repos
---
/* Le nom du cache change à chaque build : une nouvelle version du site
   invalide donc automatiquement l'ancien cache. */
var CACHE_NAME = "brique-{{ site.time | date: '%Y%m%d%H%M%S' }}";
var BASEURL = "{{ site.baseurl }}";
var PRECACHE = [
  BASEURL + "/",
  BASEURL + "/assets/css/style.css",
  BASEURL + "/assets/js/progress.js",
  BASEURL + "/assets/img/logo.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function putInCache(request, response) {
  if (!response.ok || response.type === "opaque") return;
  var clone = response.clone();
  caches.open(CACHE_NAME).then(function (cache) {
    cache.put(request, clone);
  });
}

self.addEventListener("fetch", function (e) {
  var request = e.request;

  if (request.method !== "GET") return;

  // On ne met en cache que nos propres ressources.
  if (new URL(request.url).origin !== self.location.origin) return;

  /* Contenu pédagogique (pages HTML, index de recherche) : réseau d'abord.
     Une correction publiée est ainsi visible immédiatement, et le cache ne
     sert que de repli hors ligne. */
  var isContent = request.mode === "navigate" ||
    (request.headers.get("accept") || "").indexOf("text/html") !== -1 ||
    new URL(request.url).pathname.indexOf("/search.json") !== -1;

  if (isContent) {
    e.respondWith(
      fetch(request).then(function (response) {
        putInCache(request, response);
        return response;
      }).catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match(BASEURL + "/");
        });
      })
    );
    return;
  }

  /* Ressources statiques versionnées par le cache (CSS, JS, images) :
     cache d'abord, c'est le cas où il apporte vraiment quelque chose. */
  e.respondWith(
    caches.match(request).then(function (cached) {
      return cached || fetch(request).then(function (response) {
        putInCache(request, response);
        return response;
      });
    })
  );
});
