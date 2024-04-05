window.onload = function () {
    if (navigator.onLine) {
        const id = new URLSearchParams(window.location.search).get('id');
        fetch(`http://localhost:3000/observation?id=${id}`)
            .then((res) => {
                return res.json();
            }).then((observation) => {
            injectDetails(observation)
        })
    } else {
        console.log("Offline mode")
        const id = new URLSearchParams(window.location.search).get('id');
        openObservationsIDB().then((db) => {
            getObservation(db, id).then((observation) => {
                injectDetails(observation)
            })
        })
    }
}