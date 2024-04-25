const newObservation = function(data) {
    const flowering = !!data.flowering;
    const fragrant = !!data.fragrant;
    const fruiting = !!data.fruiting;
    const native = !!data.native;

    return {
        nickname: data.nickname,
        name: data.name,
        status: "In progress",
        image: data.image,
        lastModified: new Date(),
        dateSeen: data.dateSeen,
        description: data.description,
        location: {
            latitude: data.latitude,
            longitude: data.longitude
        },
        comments: [],
        height: data.height,
        spread: data.spread,
        sunlight: data.sunlight,
        soil_type: data.soil_type,
        flowering: flowering,
        fragrant: fragrant,
        fruiting: fruiting,
        native: native
    }
}

window.onload = function () {
    const observationForm = document.getElementById("observation-form");

    observationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        let formData = new FormData(observationForm);

        if (navigator.onLine) {
            fetch('http://localhost:3000/add', {
                method: 'POST',
                body: formData
            }).then(response => {
                if ( !response.ok ) {
                    throw new Error("Network response not ok");
                }
                return response;
            }).then(observation => {
                // Save data into the indexedDB
                openObservationsIDB().then((db) => {
                    addObservation(db, observation);
                })
                window.location.href = 'http://localhost:3000/';
            }).catch((error) => {
                console.log(error);
            })
        } else {
            console.log("Offline mode")
            let formData = Object.fromEntries(new FormData(observationForm));

            openNSyncObservationsIDB().then((sDB) => {
                addNSyncObservation(sDB, newObservation(formData));
                window.location.href = 'http://localhost:3000/';
            }).catch((error) => {
                console.log('error');
            })
        }
    });
}