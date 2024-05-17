importScripts('/js/idb_util.js');
importScripts('/js/new_sync_idb_util.js');

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
                '/images/favicon.ico'
            ];
            let uploads = await getAllFilePaths("public/images/uploads");
            let javascripts = await getAllFilePaths("public/js");
            let stylesheets = await getAllFilePaths("public/stylesheets");
            await cache.addAll(requests.concat(uploads).concat(javascripts).concat(stylesheets));
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
        const cachedResponse = await cache.match(event.request, {'ignoreSearch' : true});
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);
        return fetch(event.request);
    })());
});

self.addEventListener("message", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open("cache_v1");
            await cache.add(event.data);
        })()
    );
})

self.addEventListener('sync', event => {
    if (event.tag === 'sync-observations') {
        event.waitUntil(
            openNSyncObservationsIDB()
                .then((db) => getAllNSyncObservations(db))
                .then((observations) => {
                    return Promise.all(observations.map((observation) => syncNewObservation(observation)));
                })
                .catch((error) => {
                    console.error("Error during sync: ", error);
                })
        );
    }
});

function syncNewObservation(observation) {
    const fileInfo = observation.image;

    // Convert the fileInfo back to a Blob and then to a File
    const imageBlob = new Blob([fileInfo], { type: fileInfo.type });
    const imageFile = new File(
        [imageBlob],
        fileInfo.name,
        { type: fileInfo.type, lastModified: fileInfo.lastModified }
    );

    observation.image = "";
    const syncID = parseInt(observation._id);
    delete observation._id;

    const jsonData = JSON.stringify(observation);

    const formData = new FormData();
    formData.append('data', jsonData);
    formData.append('image', imageFile);

    // Log the formData content for debugging
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    return fetch("http://localhost:3000/addSync", {
        method: "POST",
        body: formData, // Send FormData instead of jsonData
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response not ok: " + response.statusText);
            }
            return response.json();
        })
        .then(async (savedObservation) => {
            savedObservation = JSON.parse(savedObservation);
            const cache = await caches.open("cache_v1");
            await cache.add(savedObservation.image);
            console.log(observation._id, parseInt(observation._id));
            return Promise.all([
                openObservationsIDB().then((db) => addObservation(db, savedObservation)),
                openNSyncObservationsIDB().then((db) => deleteNSyncObservation(db, syncID))
            ]);
        })
        .catch((error) => {
            console.log("Failed to fetch: ", error);
            throw error; // Re-throw the error to handle it in the sync event
        });
}




