function openObservationsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("observations", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('observations', {keyPath: '_id', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

// TODO: create indices to enable sorting and searching by different fields

const getObservation = (IDB, observationID) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["observations"]);
        const observationStore = transaction.objectStore("observations");
        const request = observationStore.get(observationID);

        request.addEventListener("success", (event) => {
            resolve(event.target.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const getAllObservations = (IDB) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["observations"]);
        const observationStore = transaction.objectStore("observations");
        const request = observationStore.getAll();

        request.addEventListener("success", (event) => {
            resolve(event.target.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const deleteObservation = (IDB, observationID) => {
    const transaction = IDB.transaction(["observations"], "readwrite")
    const observationStore = transaction.objectStore("observations")
    const request = observationStore.delete(observationID)

    request.addEventListener("success", () => {
        console.log("Deleted " + observationID)
    })
}

// TODO: must be replaced with a 'sync' method which adds only the necessary updates to the IDB
// Syncing is the only time the IDB should be written to
const deleteAllObservations = (IDB) => {
    const transaction = IDB.transaction(["observations"], "readwrite");
    const observationStore = transaction.objectStore("observations");
    const request = observationStore.clear();

    return new Promise((resolve, reject) => {
        request.addEventListener("success", () => {
            resolve();
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};

// TODO: must be replaced with a 'sync' method which adds only the necessary updates to the IDB
const addObservation = (IDB, observation) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["observations"], "readwrite");
        const observationStore = transaction.objectStore("observations");
        const addRequest = observationStore.add(observation);

        addRequest.addEventListener("success", () => {
            resolve();
        });

        addRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

// TODO: must be replaced with a 'sync' method which adds only the necessary updates to the IDB
const addAllObservations = (IDB, observations) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["observations"], "readwrite");
        const observationStore = transaction.objectStore("observations");

        const addPromises = observations.map(observation => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = observationStore.add(observation);

                addRequest.addEventListener("success", () => {
                    resolveAdd();
                });

                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error);
                });
            });
        });

        Promise.all(addPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}