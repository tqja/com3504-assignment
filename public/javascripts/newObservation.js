const getUserData = () => {
   return {
        nickname: document.getElementById("nickname").value,
        name: document.getElementById("name").value,
        image: document.getElementById("name").value,
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

        if (navigator.onLine) {
            fetch('http://localhost:3000/add', {
                method: 'POST',
                body: JSON.stringify(getUserData()),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                // Save data into the indexedDB
                openObservationsIDB().then((db) => {
                    addObservation(db, getUserData());
                })
            }).catch((error) => {
                console.log(error);
            })
        } else {
            openSyncObservationsIDB().then((sDB) => {
                addNewSyncObservation(sDB, getUserData());
                window.location.href = 'http://localhost:3000/';
            }).catch((error) => {
                console.log('error');
            })
        }
    });
}