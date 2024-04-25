function openUSyncObservationsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("updated-sync-observations", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('updated-sync-observations', {keyPath: '_id', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

const addUSyncObservation = (IDB, observation) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["updated-sync-observations"], "readwrite");
        const observationStore = transaction.objectStore("updated-sync-observations");
        const request = observationStore.add(observation);

        request.addEventListener("success", () => {
            resolve();
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const getUSyncObservation = (IDB, observationID) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["updated-sync-observations"]);
        const observationStore = transaction.objectStore("updated-sync-observations");
        const request = observationStore.get(observationID);

        request.addEventListener("success", (event) => {
            resolve(event.target.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const getAllUSyncObservations = (IDB) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["updated-sync-observations"]);
        const observationStore = transaction.objectStore("updated-sync-observations");
        const request = observationStore.getAll();

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const updateUSyncObservation = (IDB, observation) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["updated-sync-observations"], "readwrite")
        const observationStore = transaction.objectStore("updated-sync-observations")
        const request = observationStore.put(observation)

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    })
}

const deleteUSyncObservation = (IDB, observationID) => {
    const transaction = IDB.transaction(["updated-sync-observations"], "readwrite")
    const observationStore = transaction.objectStore("updated-sync-observations")
    const request = observationStore.delete(observationID)

    request.addEventListener("success", () => {
        console.log("Deleted " + observationID)
    })
}