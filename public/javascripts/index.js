const insertObservationInList = (observation) => {
    const photoGrid = document.getElementsByClassName("photo-grid").item(0);

    let photoItem = document.createElement('div');
    photoItem.classList.add('photo-item');

    let link = document.createElement('a');
    let url = new URL(`http://localhost:3000/observations?id=${observation._id}`);
    link.setAttribute('href', url);
    link.style.width = '200px';

    let image = document.createElement('img');
    image.setAttribute('src', observation.image);

    let descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('description-container');

    let description = document.createElement('span');
    description.classList.add('photo-description');
    description.textContent = observation.name;

    link.appendChild(image);
    descriptionContainer.appendChild(description);
    photoItem.appendChild(link);
    photoItem.appendChild(descriptionContainer);

    photoGrid.appendChild(photoItem);
}

window.onload = function () {
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
            }).then((observations) => {
            openObservationsIDB().then((db) => {
                //insertObservationInList(db, observations)
                deleteAllExistingObservationsFromIDB(db).then(() => {
                    addNewObservationsToIDB(db, observations).then(() => {
                        console.log("All new observations added to IDB")
                    })
                })
            })
        })
    } else {
        // console.log("Offline mode")
        // openObservationsIDB().then((db) => {
        //     getAllObservations(db).then((observations) => {
        //         insertObservationInList(observations)
        //     })
        // })
    }
}