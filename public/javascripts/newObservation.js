const getUserData = () => {
   return {
        nickname: document.getElementById("nickname").value,
        name: document.getElementById("name").value,
        image: document.getElementById("image").files[0],
        dateSeen: document.getElementById("dateSeen").value,
        description: document.getElementById("description").value,
        latitude: document.getElementById("latitude").value,
        longitude: document.getElementById("longitude").value,
        height: document.getElementById("height").value,
        spread: document.getElementById("spread").value,
        sunlight: document.getElementById("sunlight").value,
        soilType: document.getElementById("soiltype").value,
        flowering: document.getElementById("flowering").checked,
        fragrant: document.getElementById("fragrant").checked,
        fruiting: document.getElementById("fruiting").checked,
        native: document.getElementById("native").checked
    }
}

window.onload = function () {
    const observationForm = document.getElementById("observation-form");

    observationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const image = document.getElementById("image").files[0];
        let formData = new FormData(observationForm);
        //formData.append("image", image);

        for (const entry of formData.entries()) {
            console.log(entry);
        }

        if (navigator.onLine) {
            fetch('http://localhost:3000/add', {
                method: 'POST',
                body: formData
            }).then(response => {
                // Save data into the indexedDB
                openObservationsIDB().then((db) => {
                    addObservation(db, getUserData());
                })
                window.location.href = 'http://localhost:3000/';
            }).catch((error) => {
                console.log(error);
            })
        } else {
            console.log(getUserData());
            openSyncObservationsIDB().then((sDB) => {
                addNewSyncObservation(sDB, getUserData());
                window.location.href = 'http://localhost:3000/';
            }).catch((error) => {
                console.log('error');
            })
        }
    });
}