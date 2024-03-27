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

const getAllObservations = (IDB) => {
    return new Promise((resolve, reject) => {
        const transaction = IDB.transaction(["observations"]);
        const observationStore = transaction.objectStore("observations");
        const getAllRequest = observationStore.getAll();

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            resolve(event.target.result); // Use event.target.result to get the result
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const deleteAllExistingObservationsFromIDB = (IDB) => {
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

const addNewObservationsToIDB = (todoIDB, observations) => {
    return new Promise((resolve, reject) => {
        const transaction = todoIDB.transaction(["observations"], "readwrite");
        const observationStore = transaction.objectStore("observations");

        const addPromises = observations.map(observation => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = observationStore.add(observation);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + observation.text);
                    const getRequest = observationStore.get(addRequest.result);
                    getRequest.addEventListener("success", () => {
                        console.log("Found " + JSON.stringify(getRequest.result));
                        // Assume insertTodoInList is defined elsewhere
                        insertTodoInList(getRequest.result);
                        resolveAdd(); // Resolve the add promise
                    });
                    getRequest.addEventListener("error", (event) => {
                        rejectAdd(event.target.error); // Reject the add promise if there's an error
                    });
                });
                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error); // Reject the add promise if there's an error
                });
            });
        });

        // Resolve the main promise when all add operations are completed
        Promise.all(addPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};