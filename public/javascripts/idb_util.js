// Function to handle adding a new todo
// const addNewTodoToSync = (syncTodoIDB, txt_val) => {
//     // Retrieve todo text and add it to the IndexedDB
//
//     if (txt_val !== "") {
//         const transaction = syncTodoIDB.transaction(["sync-todos"], "readwrite")
//         const todoStore = transaction.objectStore("sync-todos")
//         const addRequest = todoStore.add({text: txt_val})
//         addRequest.addEventListener("success", () => {
//             console.log("Added " + "#" + addRequest.result + ": " + txt_val)
//             const getRequest = todoStore.get(addRequest.result)
//             getRequest.addEventListener("success", () => {
//                 console.log("Found " + JSON.stringify(getRequest.result))
//                 // Send a sync message to the service worker
//                 navigator.serviceWorker.ready.then((sw) => {
//                     sw.sync.register("sync-todo")
//                 }).then(() => {
//                     console.log("Sync registered");
//                 }).catch((err) => {
//                     console.log("Sync registration failed: " + JSON.stringify(err))
//                 })
//             })
//         })
//     }
// }
//
// // Function to add new todos to IndexedDB and return a promise
//
//
//
// // Function to get the todo list from the IndexedDB
// const getAllSyncTodos = (syncTodoIDB) => {
//     return new Promise((resolve, reject) => {
//         const transaction = syncTodoIDB.transaction(["sync-todos"]);
//         const todoStore = transaction.objectStore("sync-todos");
//         const getAllRequest = todoStore.getAll();
//
//         getAllRequest.addEventListener("success", () => {
//             resolve(getAllRequest.result);
//         });
//
//         getAllRequest.addEventListener("error", (event) => {
//             reject(event.target.error);
//         });
//     });
// }
//
// // Function to delete a syn
// const deleteSyncTodoFromIDB = (syncTodoIDB, id) => {
//     const transaction = syncTodoIDB.transaction(["sync-todos"], "readwrite")
//     const todoStore = transaction.objectStore("sync-todos")
//     const deleteRequest = todoStore.delete(id)
//     deleteRequest.addEventListener("success", () => {
//         console.log("Deleted " + id)
//     })
// }
//
// function openSyncTodosIDB() {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open("sync-todos", 1);
//
//         request.onerror = function (event) {
//             reject(new Error(`Database error: ${event.target}`));
//         };
//
//         request.onupgradeneeded = function (event) {
//             const db = event.target.result;
//             db.createObjectStore('sync-todos', {keyPath: 'id', autoIncrement: true});
//         };
//
//         request.onsuccess = function (event) {
//             const db = event.target.result;
//             resolve(db);
//         };
//     });
// }

function openObservationsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("observations", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('observations', {keyPath: '_id'});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

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

const deleteAllObservations = (IDB) => {
    const transaction = IDB.transaction(["observations"], "readwrite");
    const observationStore = transaction.objectStore("observations");
    const clearRequest = observationStore.clear();

    return new Promise((resolve, reject) => {
        clearRequest.addEventListener("success", () => {
            resolve();
        });

        clearRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};

const addObservation = (IDB,observation) => {
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