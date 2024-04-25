importScripts('/javascripts/idb_util.js');
importScripts('/javascripts/new_sync_idb_util.js');

async function getAllFilePaths(directoryPath) {
    try {
        const response = await fetch('/dir', {
            method: 'POST',
            body: JSON.stringify({
                directoryPath: directoryPath
            }),
            headers: {'Content-Type': 'application/json'}
        });

        if (!response.ok) {
            throw new Error('Failed to fetch directory listing');
        }

        const files = await response.json();
        return files.fileList; // Return the fileList
    } catch (err) {
        console.error('Error fetching directory:', err);
        throw err; // Rethrow the error for the caller to handle
    }
}

self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {
        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("cache_v1");
            let requests = [
                '/',
                '/create',
                '/observations',
                '/manifest.json',
                '/javascripts/index.js',
                '/javascripts/idb_util.js',
                '/javascripts/new_sync_idb_util.js',
                '/javascripts/updated_sync_idb_util.js',
                '/javascripts/newObservation.js',
                '/javascripts/observationdetails.js',
                '/stylesheets/style.css'
            ];
            let photos = await getAllFilePaths("public/photos");
            let uploads = await getAllFilePaths("public/images/uploads");
            console.log(requests.concat(photos).concat(uploads));
            await cache.addAll(requests.concat(photos).concat(uploads));
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
        console.log(event.request);
        const cachedResponse = await cache.match(event.request, {'ignoreSearch' : true});
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
