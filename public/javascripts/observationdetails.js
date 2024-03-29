const injectDetails = (observation) => {
    const container = document.getElementsByClassName("observation-details").item(0);

    const title = document.createElement('h1');
    title.textContent = `Observation Details: ${observation.name}`;
    container.appendChild(title);

    const image = document.createElement('img');
    image.setAttribute('src', `/${observation.image}`);
    image.setAttribute('alt', 'Observation Image');
    image.style.maxWidth = '400px';
    container.appendChild(image);

    const properties = [
        { label: 'Nickname', value: observation.nickname },
        { label: 'Status', value: observation.status },
        { label: 'Date Seen', value: new Date(observation.dateSeen).toDateString() },
        { label: 'Description', value: observation.description },
        { label: 'Location', value: `Latitude ${observation.location.latitude}, Longitude ${observation.location.longitude}` },
        { label: 'Height', value: observation.height },
        { label: 'Spread', value: observation.spread },
        { label: 'Sunlight', value: observation.sunlight },
        { label: 'Soil Type', value: observation.soilType },
        { label: 'Flowering', value: observation.flowering ? 'Yes' : 'No' },
        { label: 'Fragrant', value: observation.fragrant ? 'Yes' : 'No' },
        { label: 'Fruiting', value: observation.fruiting ? 'Yes' : 'No' },
        { label: 'Native', value: observation.native ? 'Yes' : 'No' }
    ];

    properties.forEach(property => {
        const paragraph = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${property.label}: `;
        paragraph.appendChild(strong);
        paragraph.innerHTML += property.value;
        container.appendChild(paragraph);
    });
}

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