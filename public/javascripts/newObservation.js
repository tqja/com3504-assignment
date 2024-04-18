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
                // Save data into the indexedDB
                openObservationsIDB().then((db) => {
                    addObservation(db, getUserData());
                })
                window.location.href = 'http://localhost:3000/';
            }).catch((error) => {
                console.log(error);
            })
        } else {
            let formData = Object.fromEntries(new FormData(observationForm));

            openSyncObservationsIDB().then((sDB) => {
                addNewSyncObservation(sDB, formData);
                window.location.href = 'http://localhost:3000/';
            }).catch((error) => {
                console.log('error');
            })
        }
    });
}