function openNSyncObservationsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("new-sync-observations", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('new-sync-observations', {keyPath: '_id', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

const addNSyncObservation = (IDB, observation) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["new-sync-observations"], "readwrite");
        const observationStore = transaction.objectStore("new-sync-observations");
        const request = observationStore.add(observation);

        request.addEventListener("success", () => {
            resolve();
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const getNSyncObservation = (IDB, observationID) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["new-sync-observations"]);
        const observationStore = transaction.objectStore("new-sync-observations");
        const request = observationStore.get(observationID);

        request.addEventListener("success", (event) => {
            console.log(event.target.result);
            resolve(event.target.result);
        });

        request.addEventListener("error", (event) => {
            console.error("Error retrieving observation:", event.target.error);
            reject(event.target.error);
        });
    });
}

const getAllNSyncObservations = (IDB) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["new-sync-observations"]);
        const observationStore = transaction.objectStore("new-sync-observations");
        const request = observationStore.getAll();

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const updateNSyncObservation = (IDB, observation) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["new-sync-observations"], "readwrite")
        const observationStore = transaction.objectStore("new-sync-observations")
        const request = observationStore.put(observation)

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    })
}