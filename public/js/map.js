// initialise Leaflet map
const map = L.map('map').setView([51.505, -0.09], 8);
map.setMinZoom(0.5);

// add tile layer from OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// add LayerGroup to map to contain markers
let markers = L.layerGroup().addTo(map);

const reverseGeocode = (lat, lng) => {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
  return fetch(url).then(response => {
    return response.json();
  }).catch(err => {
    console.error(err);
    return null;
  })
}

let position = null;
const locationText = document.getElementById('location');

/**
 * Displays the latitude and longitude in the locationText element.
 * @param lat - The latitude .
 * @param lng - The longitude.
 */
const setLocationText = async (lat, lng) => {
  // ensure lng lies between -180 and 180 so the API call works correctly
  lng = ((lng + 180) % (180 * 2) + (180 * 2)) % (180 * 2) - 180;
  const data = await reverseGeocode(lat, lng);
  locationText.innerHTML = '';
  if (data && data.countryCode && data.principalSubdivision && data.city && data.locality) {
    if (data.locality !== data.city) {
      locationText.innerHTML += `${data.locality}, `;
    }
    locationText.innerHTML += `${data.city}, ${data.principalSubdivision}, ${data.countryCode}`;
  }
  locationText.innerHTML += `; Latitude ${lat}, Longitude ${lng}`;
}

/**
 * Clears the marker layer, adds a new marker at latlng position, and sets the location message to the position.
 * @param latlng - The object containing latitude and longitude.
 */
const moveMarker = async (latlng) => {
  markers.clearLayers();
  L.marker(latlng).addTo(markers);
  position = latlng;
  await setLocationText(position.lat, position.lng);
}

/** Places a marker on the map at the mouse cursor's position on click. */
const onMapClick = async (e) => {
  await moveMarker(e.latlng);
};

/**
 * Use the Geolocation API to request the user's location. On success, set the map position and marker to the user's
 * location. On failure, display an error message.
 */
const findMe = () => {
  const success = async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    map.setView([lat, lng], 15);
    await moveMarker({lat, lng})
    position = {lat, lng};
  }

  const error = () => {
    locationText.innerHTML = 'Unable to retrieve location automatically, please use the map to select your location.';
  }

  // check if the browser supports geolocation
  if (!navigator.geolocation) {
    locationText.innerHTML = 'Geolocation is not supported by your browser. Please use the map to select your location.';
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

map.on('click', onMapClick);

const findBtn = document.getElementById('find-me');
findBtn.addEventListener('click', findMe);
