function openUsernameIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("clientData", 1);

    request.onerror = function (event) {
      reject(new Error(`Database error: ${event.target}`));
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore('clientData', {keyPath: '_id', autoIncrement: true});
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };
  });
}

const getUsername = (IDB) => {
  return new Promise((resolve, reject) => {
    const transaction = IDB.transaction(["clientData"]);
    const observationStore = transaction.objectStore("clientData");
    const request = observationStore.get("username");

    request.addEventListener("success", (event) => {
      resolve(event.target.result);
    });

    request.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
}

// /**
//  * Retrieve the value of the username item in the indexedDB.
//  * @returns {Promise<unknown>} The error code on failure, or the username on success
//  */
// const getUsernameFromIDB = () => {
//   return new Promise((resolve, reject) => {
//     const req = window.indexedDB.open("clientData", 1);
//
//     req.onsuccess = (e) => {
//       // open db/store and get the value from "username" key
//       const db = e.target.result;
//       const transaction = db.transaction(["userStore"]);
//       const store = transaction.objectStore("userStore");
//       const req = store.get("username");
//
//       req.onsuccess = (e) => {
//         resolve(e.target.result);
//       };
//
//       req.onerror = (e) => {
//         reject(e.target.errorCode);
//       };
//     };
//
//     req.onerror = (e) => {
//       reject(e.target.errorCode);
//     };
//
//     req.onupgradeneeded = (e) => {
//       const db = e.target.result;
//       // create object store if it doesn't already exist
//       if (!db.objectStoreNames.contains("userStore")) {
//         db.createObjectStore("userStore");
//       }
//     };
//   });
// };

const storeUsername = (IDB, username) => {
  return new Promise((resolve, reject) => {
    const transaction = IDB.transaction(["clientData"], "readwrite");
    const observationStore = transaction.objectStore("clientData");
    const addRequest = observationStore.add(username);

    addRequest.addEventListener("success", () => {
      resolve();
    });

    addRequest.addEventListener("error", (event) => {
      reject(event.target.error);
    });
  });
}

// /**
//  * Store a username as an item in the indexedDB.
//  * @param username The username to store
//  * @returns {Promise<unknown>} The error code on failure, or undefined value on success
//  */
// const storeUsernameInIDB = (username) => {
//   return new Promise((resolve, reject) => {
//     const req = window.indexedDB.open("clientData", 1);
//
//     req.onerror = (e) => {
//       reject(e.target.errorCode);
//     };
//
//     req.onsuccess = (e) => {
//       const db = e.target.result;
//       // readwrite transaction in order to store username
//       const transaction = db.transaction(["userStore"], "readwrite");
//       const store = transaction.objectStore("userStore");
//       const req = store.put(username, "username");
//
//       req.onsuccess = () => {
//         resolve();
//       };
//
//       req.onerror = (e) => {
//         reject(e.target.errorCode);
//       };
//     };
//
//     req.onupgradeneeded = (e) => {
//       const db = e.target.result;
//       // create object store if it doesn't already exist
//       if (!db.objectStoreNames.contains("userStore")) {
//         db.createObjectStore("userStore");
//       }
//     };
//   });
// };
