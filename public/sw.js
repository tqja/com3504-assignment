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

function syncNewObservation(observation) {
    // Extract the file info from the JSON object
    const fileInfo = observation.image;

    // Create a new File object using the extracted info
    const imageFile = new File(
        [fileInfo],
        fileInfo.name,
        { type: fileInfo.type, lastModified: fileInfo.lastModified }
    );

    // Set the image field to an empty string
    observation.image = "";
    delete observation._id;

    // Convert the JSON object to a JSON string
    //const jsonData = JSON.stringify(observation);

    // Prepare FormData
    const formData = new FormData();
    formData.append('data', observation);
    formData.append('image', imageFile);

    // Send the form data via a POST request
    fetch("http://localhost:3000/add", {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response not ok");
            }
            return response.json();
        })
        .then(async (savedObservation) => {
            savedObservation = JSON.parse(savedObservation);
            console.log(savedObservation);
            const cache = await caches.open("cache_v1");
            await cache.add(savedObservation.image);
            // Save data into the indexedDB
            openObservationsIDB().then((db) => {
                addObservation(db, savedObservation);
            });
            openNSyncObservationsIDB().then((db) => {
                deleteNSyncObservation(db, observation._id);
            })
        })
        .catch((error) => {
            console.log(error);
        });
}

//Sync event to sync the observations
self.addEventListener('sync', event => {
    if (event.tag === 'sync-observations') {
        event.waitUntil(
            openNSyncObservationsIDB().then((db) => {
                getAllNSyncObservations(db).then((observations) => {
                    observations.forEach((observation) => {
                        syncNewObservation(observation);
                    })
                })
            })
        )
    }
});
