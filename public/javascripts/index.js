const insertTodoInList = (todo) => {
    if (todo.text) {
        const copy = document.getElementById("todo_template").cloneNode()
        copy.removeAttribute("id") // otherwise this will be hidden as well
        copy.innerText = todo.text
        copy.setAttribute("data-todo-id", todo.id)

        // Insert sorted on string text order - ignoring case
        const todolist = document.getElementById("todo_list")
        const children = todolist.querySelectorAll("li[data-todo-id]")
        let inserted = false
        for (let i = 0; (i < children.length) && !inserted; i++) {
            const child = children[i]
            const copy_text = copy.innerText.toUpperCase()
            const child_text = child.innerText.toUpperCase()
            if (copy_text < child_text) {
                todolist.insertBefore(copy, child)
                inserted = true
            }
        }
        if (!inserted) { // Append child
            todolist.appendChild(copy)
        }
    }
}

window.onload = function () {
    //
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (registration) {
                console.log('Service Worker Registered!', registration);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    // if ("Notification" in window) {
    //     if (Notification.permission === "granted") {
    //         // Notification permission granted
    //     } else if (Notification.permission !== "denied") {
    //         Notification.requestPermission().then((permission) => {
    //             if (permission === "granted") {
    //                 navigator.serviceWorker.ready
    //                     .then((serviceWorkerRegistration => {
    //                         serviceWorkerRegistration.showNotification("Todo App",
    //                             {body: "Notifications are enabled!"})
    //                             .then(r => {
    //                                 console.log(r)
    //                             });
    //                     }));
    //             }
    //         });
    //     }
    // }

    if (navigator.onLine) {
        fetch('http://localhost:3000/allObservations')
            .then((res) => {
                return res.json();
            }).then((newTodos) => {
            openObservationsIDB().then((db) => {
                insertTodoInList(db, newTodos)
                deleteAllExistingObservationsFromIDB(db).then(() => {
                    addNewObservationsToIDB(db, newTodos).then(() => {
                        console.log("All new todos added to IDB")
                    })
                })
            })
        })
    } else {
        console.log("Offline mode")
        openTodosIDB().then((db) => {
            getAllTodos(db).then((todos) => {
                for (const todo of todos) {
                    insertTodoInList(todo)
                }
            })
        })
    }
}