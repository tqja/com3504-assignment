function openNSyncObservationsIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("new-sync-observations", 1);

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

    request.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
};

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

function getAllNSyncObservations(IDB) {
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

const getFilteredNSyncObservations = (IDB) => {};

const updateNSyncObservation = (IDB, observation) => {
  return new Promise((resolve, reject) => {
    const transaction = IDB.transaction(["new-sync-observations"], "readwrite");
    const observationStore = transaction.objectStore("new-sync-observations");
    const request = observationStore.put(observation);

    request.addEventListener("success", () => {
      resolve(request.result);
    });

    request.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
};

const deleteNSyncObservation = (IDB, observationID) => {
  const transaction = IDB.transaction(["new-sync-observations"], "readwrite");
  const observationStore = transaction.objectStore("new-sync-observations");
  const request = observationStore.delete(observationID);

  request.addEventListener("success", () => {
    console.log("Deleted " + observationID);
  });
};
