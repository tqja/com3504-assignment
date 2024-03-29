// define db and store names
const dbName = "clientData";
const storeName = "userStore";

/**
 * Retrieve the value of the username item in the indexedDB.
 * @returns {Promise<unknown>} The error code on failure, or the username on success
 */
export const getUsernameFromIDB = () => {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(dbName, 1);

    req.onsuccess = (e) => {
      // open db/store and get the value from "username" key
      const db = e.target.result;
      const transaction = db.transaction([storeName]);
      const store = transaction.objectStore(storeName);
      const req = store.get("username");

      req.onsuccess = (e) => {
        resolve(e.target.result);
      };

      req.onerror = (e) => {
        reject(e.target.errorCode);
      };
    };

    req.onerror = (e) => {
      reject(e.target.errorCode);
    };

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      // create object store if it doesn't already exist
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
};

/**
 * Store a username as an item in the indexedDB.
 * @param username The username to store
 * @returns {Promise<unknown>} The error code on failure, or undefined value on success
 */
export const storeUsernameInIDB = (username) => {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(dbName, 1);

    req.onerror = (e) => {
      reject(e.target.errorCode);
    };

    req.onsuccess = (e) => {
      const db = e.target.result;
      // readwrite transaction in order to store username
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const req = store.put(username, "username");

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = (e) => {
        reject(e.target.errorCode);
      };
    };

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      // create object store if it doesn't already exist
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
};
