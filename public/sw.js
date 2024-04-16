importScripts('/javascripts/idb_util.js');

self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {
        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("cache_v1");
            await cache.addAll([
                '/',
                '/create',
                '/manifest.json',
                '/javascripts/index.js',
                '/javascripts/idb_util.js',
                '/stylesheets/style.css',
                '/photos/flower-no.png',
                '/photos/flower-yes.png',
                '/photos/sun.png',
                '/photos/sun-full.png',
                '/photos/sun-partial.png',
                // '/photos/sun-full-shaded.png',
                '/photos/sun-no-preference.png'
            ]);
            console.log('Service Worker: App Shell Cached');
        }
        catch{
            console.log("error occured while caching...")
        }

    })());
});

//clear cache on reload
self.addEventListener('activate', event => {
// Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if(cache !== "cache_v1") {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

// Fetch event to fetch from cache first
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open("cache_v1");
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);
        return fetch(event.request);
    })());
});

//Sync event to sync the todos
// self.addEventListener('sync', event => {
//     if (event.tag === 'sync-todo') {
//         console.log('Service worker: syncing new todos');
//         openSyncTodosIDB((syncPostDB) => {
//             getAllSyncTodos(syncPostDB)
//         })
//     }
// });
