// opening the indexedDB for sync observations
function openNSyncObservationsIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("new-sync-observations", 1);
    // error handling
    request.onerror = function (event) {
      reject(new Error(`Database error: ${event.target}`));
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore("new-sync-observations", {
        keyPath: "_id",
        autoIncrement: true,
      });
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };
  });
}

/**
 *
 * @param IDB - The indexedDB object
 * @param observation
 * @returns Promise - resolves when observation is added
 */
const addNSyncObservation = (IDB, observation) => {
  return new Promise((resolve, reject) => {
    const transaction = IDB.transaction(["new-sync-observations"], "readwrite");
    const observationStore = transaction.objectStore("new-sync-observations");
    const request = observationStore.add(observation);

    request.addEventListener("success", () => {
      navigator.serviceWorker.ready.then((sw) => {
        sw.sync
          .register("sync-observations")
          .then(() => {
            console.log("Sync registered");
            resolve();
          })
          .catch((err) => {
            console.log("Sync registration failed: " + JSON.stringify(err));
            reject(err);
          });
      });
    });
    // error handling for adding observation
    request.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
};
/**
 *
 * @param IDB - The indexedDB object
 * @param observationID - the ID of the observation to be retrieved
 * @returns Promise - resolves with the retrieved observation
 */
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
};

/**
 *
 * @param IDB - The indexedDB object
 * @returns Promise - resolves with all observations in the indexedDB
 */
function getAllNSyncObservations(IDB) {
  return new Promise((resolve, reject) => {
    const transaction = IDB.transaction(["new-sync-observations"]);
    const observationStore = transaction.objectStore("new-sync-observations");
    const request = observationStore.getAll();

    request.addEventListener("success", () => {
      resolve(request.result);
    });
    // error handling when retrieving all observations
    request.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
}

const getFilteredNSyncObservations = (IDB) => {};

/**
 * function that updates an observation in the indexedDB
 *
 * @param IDB - The indexedDB object
 * @param observation
 * @returns {Promise} - resolves with the newly fixed observation
 */
const updateNSyncObservation = (IDB, observation) => {
  return new Promise((resolve, reject) => {
    const transaction = IDB.transaction(["new-sync-observations"], "readwrite");
    const observationStore = transaction.objectStore("new-sync-observations");
    const request = observationStore.put(observation);

    request.addEventListener("success", () => {
      resolve(request.result);
    });
    // error handling for during observation update
    request.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
};
/**
 * Function to delete an observation from the indexedDB
 *
 * @param IDB - The indexedDB object
 * @param observationID - the ID that needs to be deleted
 */
const deleteNSyncObservation = (IDB, observationID) => {
  const transaction = IDB.transaction(["new-sync-observations"], "readwrite");
  const observationStore = transaction.objectStore("new-sync-observations");
  const request = observationStore.delete(observationID);
  // event listener for correct deletion
  request.addEventListener("success", () => {
    console.log("Deleted " + observationID);
  });
};
