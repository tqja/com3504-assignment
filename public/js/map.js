// initialise Leaflet map
const map = L.map('map').setView([51.505, -0.09], 8);

// add tile layer from OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// add LayerGroup to map to contain markers
let markers = L.layerGroup().addTo(map);

let position = null;
const locationText = document.getElementById('location');

/**
 * Displays the latitude and longitude in the locationText element.
 * @param lat - The latitude .
 * @param lng - The longitude.
 */
const setLocationText = (lat, lng) => {
  locationText.innerHTML = `Latitude ${lat}, Longitude ${lng}`;
}

/**
 * Clears the marker layer, adds a new marker at latlng position, and sets the location message to the position.
 * @param latlng - The object containing latitude and longitude.
 */
const moveMarker = (latlng) => {
  markers.clearLayers();
  L.marker(latlng).addTo(markers);
  position = latlng;
  setLocationText(position.lat, position.lng);
}

/** Places a marker on the map at the mouse cursor's position on click. */
const onMapClick = (e) => {
  moveMarker(e.latlng);
};

/**
 * Use the Geolocation API to request the user's location. On success, set the map position and marker to the user's
 * location. On failure, display an error message.
 */
const findMe = () => {
  const success = (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    map.setView([lat, lng], 15);
    moveMarker({lat, lng})
    position = {lat, lng};
    locationText.innerHTML = `Latitude ${lat}, Longitude ${lng}`;
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
