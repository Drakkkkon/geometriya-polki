/* Геометрия Полки 1.8.0: сервис-воркер.
   Сохраняет программу и картинки на устройстве: полка открывается сразу и без интернета.
   При новой версии программы меняйте VER, тогда кеш обновится. */
var VER = 'gp-1.8.0';
var CORE = ['./', 'index.html', 'vendor/jszip.min.js', 'books3d/oldbook.js'];
var IMGS = ["covers/10065.jpg", "covers/10670.jpg", "covers/10737.jpg", "covers/10838.jpg", "covers/10937.jpg", "covers/10938.jpg", "covers/11036.jpg", "covers/11064.jpg", "covers/11068.jpg", "covers/11069.jpg", "covers/11070.jpg", "covers/11139.jpg", "covers/11155.jpg", "covers/11240.jpg", "covers/12034.jpg", "covers/12139.jpg", "covers/12641.jpg", "covers/13527.jpg", "covers/14113.jpg", "covers/1993.jpg", "covers/2644.jpg", "covers/2716.jpg", "covers/4065.jpg", "covers/4167.jpg", "covers/4909.jpg", "covers/5958.jpg", "covers/6744.jpg", "covers/7527.jpg", "covers/8953.jpg", "covers/9073.jpg", "covers/9233.jpg", "covers/9236.jpg", "spines/10737.jpg", "spines/10937.jpg", "spines/11064.jpg", "spines/11070.jpg", "spines/11139.jpg", "spines/11155.jpg", "spines/11240.jpg", "spines/12034.jpg", "spines/12139.jpg", "spines/13527.jpg", "spines/14113.jpg", "spines/1993.jpg", "spines/2716.jpg", "spines/4909.jpg", "spines/5958.jpg", "spines/6744.jpg", "spines/7527.jpg", "spines/8953.jpg", "spines/9073.jpg", "spines/9233.jpg"];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VER).then(function (c) {
      return Promise.all(CORE.concat(IMGS).map(function (u) {
        return c.add(new Request(u, {cache: 'reload'})).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;
  var p = u.pathname;
  if (/\/(covers|spines|vendor|books3d)\//.test(p)) {
    /* картинки и библиотека: сначала из кеша */
    e.respondWith(
      caches.match(r, {ignoreSearch: true}).then(function (hit) {
        return hit || fetch(r).then(function (res) {
          if (res && res.ok) { var cp = res.clone(); caches.open(VER).then(function (c) { c.put(r, cp); }); }
          return res;
        });
      })
    );
    return;
  }
  if (r.mode === 'navigate' || /\/index\.html$/.test(p) || /\/$/.test(p)) {
    /* страница: сначала из сети, без сети из кеша */
    e.respondWith(
      fetch(r).then(function (res) {
        if (res && res.ok) { var cp = res.clone(); caches.open(VER).then(function (c) { c.put('index.html', cp); }); }
        return res;
      }).catch(function () {
        return caches.match('index.html').then(function (hit) { return hit || caches.match('./'); });
      })
    );
  }
});
