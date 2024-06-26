/**
 * Open and return the indexedDB as a promise.
 * @returns {Promise<unknown>} - Promise containing the db.
 */
function openObservationsIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("observations", 1);

    request.onerror = function (event) {
      reject(new Error(`Database error: ${event.target}`));
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore("observations", {
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
 * Get an observation by ID from the indexedDB.
 * @param IDB - The db to fetch the observation from.
 * @param observationID - The id of the observation to fetch.
 * @returns {Promise<unknown>} - Promise containing the post.
 */
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
};

/**
 * Get all observations from the indexedDB.
 * @param IDB - The db to fetch posts from.
 * @returns {Promise<unknown>} - The fetched observations in a Promise.
 */
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
};

/**
 * Get observations from the database and filter
 * @param IDB - The indexedDB
 * @param username - The username
 * @param filters - The filters
 * @param storeName - The name of the IDB store
 * @returns {Promise<unknown>} - The filtered observations
 */
const getFilteredObservations = (IDB, username, filters, storeName) => {
  return new Promise((resolve) => {
    const observationStore = IDB.transaction([storeName]).objectStore(
      storeName,
    );
    const req = observationStore.openCursor();
    const filteredObservations = [];

    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const o = cursor.value;

        // skip comparisons if attribute is "no-preference"
        if (
          (filters.myObservation === "no" || o.nickname === username) &&
          (filters.colour === "no-preference" || o.colour === filters.colour) &&
          (filters.soilType === "no-preference" ||
            o.soilType === filters.soilType) &&
          (filters.sunlight === "no-preference" ||
            o.sunlight === filters.sunlight) &&
          (filters.flowering === "no-preference" ||
            // convert filters.flowering to a boolean to match field in object
            o.flowering === (filters.flowering !== "no")) &&
          (filters.leafy === "no-preference" ||
            o.leafy === (filters.leafy !== "no")) &&
          (filters.fragrant === "no-preference" ||
            o.fragrant === (filters.fragrant !== "no")) &&
          (filters.fruiting === "no-preference" ||
            o.fruiting === (filters.fruiting !== "no")) &&
          (filters.native === "no-preference" ||
            o.native === (filters.native !== "no")) &&
          (filters.status === "no-preference" || o.status === filters.status)
        ) {
          filteredObservations.push(o);
        }
        cursor.continue();
      } else {
        resolve(filteredObservations);
      }
    };
  });
};

/**
 * Update an observation in the indexedDB
 * @param IDB - The db
 * @param observation The observation to update with
 * @returns {Promise<unknown>}
 */
const updateObservation = (IDB, observation) => {
  return new Promise((resolve, reject) => {
    const transaction = IDB.transaction(["observations"], "readwrite");
    const observationStore = transaction.objectStore("observations");
    const request = observationStore.put(observation);

    request.addEventListener("success", () => {
      resolve(request.result);
    });

    request.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
};

/**
 * Add an observation to the indexedDB.
 * @param IDB - The db
 * @param observation - The observation to add
 * @returns {Promise<unknown>}
 */
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
};
