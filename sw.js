---
layout: null
# Managed by BriqueParBrique/nouvelle-brique — do not edit in brick repos
---
var CACHE_NAME = "brique-v1";
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
    })
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (response) {
        if (response.ok && e.request.method === "GET") {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    }).catch(function () {
      return caches.match(BASEURL + "/");
    })
  );
});
