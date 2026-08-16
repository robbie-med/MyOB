// This app has moved to obiana.app. This worker exists to undo the old one.
//
// The previous service worker was cache-first over the whole app, so anyone
// who installed myob.robbiemed.org to their phone would keep being served the
// cached copy indefinitely and would never see the notice telling them where
// the app went. Those are precisely the people the notice is for.
//
// So: claim control immediately, delete every cache this origin holds,
// unregister, and reload any open window so it picks up the new page. There is
// deliberately no fetch handler, so nothing is intercepted in the meantime.
//
// Nothing registers this file. It is reached because a browser that already
// holds a registration re-fetches the worker script on navigation, sees these
// bytes differ from the old worker's, and installs it. A visitor arriving with
// no registration never needs it.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();

    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));

    await self.registration.unregister();

    // Reload open windows so an installed copy shows the notice now rather
    // than the next time it happens to be opened.
    const windows = await self.clients.matchAll({ type: 'window' });
    for (const w of windows) {
      if ('navigate' in w) w.navigate(w.url).catch(() => {});
    }
  })());
});
