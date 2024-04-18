import { getUsernameFromIDB } from "./idbHelper.js";

let visitorUsername = null
let chatId = null
let socket = io()
const sendChatButton = document.getElementById("chat_send")

const dbpediaDiv = document.getElementById("dbpedia");
const plantName = document.getElementById("plantName");
const nameBtn = document.getElementById("nameBtn");
const nameInput = document.getElementById("nameInput");
const nickname = document.getElementById("nickname").textContent;
const observationId = document.getElementById("observationId").innerHTML;
const statusBtn = document.getElementById("statusBtn");
const status = document.getElementById("status");
const statusDot = document.getElementById("statusDot");
const username = await getUsernameFromIDB(); // from indexedDB
const locationText = document.getElementById("location");

/**
 * Attempts to fetch a plant matching the name from DBPedia and fill the div with information.
 * @param plantName The plant to try and fetch information about
 * @returns {Promise<void>}
 */
const getDetailsFromDbpedia = async (plantName) => {
  fetch(`/sparqlQuery?plantName=${plantName}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data[0]) {
        // fill the dbpedia elements with the fetched data
        const plant = data[0];
        const common = document.getElementById("dbpCommonName");
        const scientific = document.getElementById("dbpScientificName");
        const description = document.getElementById("dbpDescription");
        const uri = document.getElementById("dbpURI");

        common.textContent += plant.commonName.value;
        scientific.textContent += plant.scientificName.value;
        description.textContent = plant.description.value;
        uri.href = plant.plant.value;
        uri.textContent = plant.plant.value;

        // reveal the div
        dbpediaDiv.hidden = false;
      } else {
        // hide div if query failed (name not found)
        dbpediaDiv.hidden = true;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

/**
 * Allows the original poster to update the name of the observation.
 * @returns {Promise<void>}
 */
const handleNameUpdate = async () => {
  if (username === nickname) {
    let edit = false;
    nameBtn.addEventListener("click", () => {
      edit = !edit;
      const originalName = plantName.textContent;

      if (edit) {
        // reveal the name input and change button text
        nameInput.classList.remove("hidden");
        nameBtn.textContent = "Save";
      } else {
        // set max length for input
        if (plantName.textContent.length > 40) {
          alert("Plant name cannot exceed 40 characters!");
        } else {
          // post new name to edit route
          fetch("/edit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              observationId: observationId,
              plantName: nameInput.value,
            }),
          })
            .then(async () => {
              await getDetailsFromDbpedia(nameInput.value);
              plantName.textContent = nameInput.value;
            })
            .catch(() => {
              alert("Failed to update name");
              plantName.textContent = originalName;
            });
          // hide the name input and change button text
          nameInput.classList.add("hidden");
          nameBtn.textContent = "Change name";
        }
      }
    });
  }
};

const normaliseLng = (lng) => {
  return ((((lng + 180) % (180 * 2)) + 180 * 2) % (180 * 2)) - 180;
};

/**
 * Uses the BigDataCloud reverse geocoding API to retrieve details of a location from the latitude and longitude.
 * @param lat - latitude of location to fetch
 * @param lng - longitude of location to fetch
 * @returns {Promise<any>}
 */
const reverseGeocode = (lat, lng) => {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
  return fetch(url)
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

/**
 * Displays the location name or latitude/longitude in the locationText element.
 */
const setLocationText = async () => {
  const lat = parseFloat(document.getElementById("lat").textContent);
  const lng = normaliseLng(
    parseFloat(document.getElementById("lng").textContent),
  );
  const data = await reverseGeocode(lat, lng);
  locationText.innerHTML = "";
  if (
    data &&
    data.countryCode &&
    data.principalSubdivision &&
    data.city &&
    data.locality
  ) {
    if (data.locality !== data.city) {
      locationText.innerHTML += `${data.locality}, `;
    }
    locationText.innerHTML += `${data.city}, ${data.principalSubdivision}, ${data.countryCode}`;
  } else {
    locationText.innerHTML = `Latitude ${lat.toFixed(4)}, Longitude ${lng.toFixed(4)}`;
  }
};

statusBtn.addEventListener("click", () => {
  // post to edit route
  fetch("/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      observationId: observationId,
      status: "Completed",
    }),
  })
    .then(() => {
      statusDot.classList.remove("bg-amber-400");
      statusDot.classList.add("bg-green-400");
      status.textContent = "Completed";
      statusBtn.remove();
      nameBtn.remove();
      nameInput.remove();
    })
    .catch((err) => {
      console.error(err);
    });
});

if (username === nickname && status.textContent !== "Completed") {
  // reveal status button if original poster
  nameBtn.hidden = false;
  statusBtn.hidden = false;
}

const initChat = () => {

  // print chat history stored in MongoDB
  let messagesStr = document.getElementById('messages').textContent
  let messages = JSON.parse(messagesStr)

  messages.forEach((message) => {
    let chat_username = message.chat_username
    let chat_text = message.chat_text
    writeOnHistory('<b>'+chat_username+'</b>' + ' ' + chat_text)
  })

  // called when someone joins the room
  socket.on('joined', (room, userId) => {
    // notifies that someone has joined the room
    writeOnHistory('<b>'+userId+'</b>' + ' joined the chat')
  })

  // called when a message is received
  socket.on('chat', (room, userId, chatText) => {
    writeOnHistory('<b>' + userId + ':</b> ' + chatText)
  })
}

/**
 * used to connect to a chat room.
 */
const connectToRoom = () => {
  chatId = document.getElementById('chatId').innerHTML
  socket.emit('create or join', chatId, visitorUsername)
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via socket
 */
const sendChatText = () => {
  let chatText = document.getElementById('chat_input').value
  socket.emit('chat', chatId, visitorUsername, chatText)
}

/**
 * it appends the given html text to the history div
 * @param text
 */
const writeOnHistory = (text) => {
  let history = document.getElementById('history')
  let paragraph = document.createElement('p')
  paragraph.innerHTML = text
  history.appendChild(paragraph)
  document.getElementById('chat_input').value = ''
}

/**
 * connects to the chat room where the visitor username serves
 * as a chat username
 * @param username
 * @param observation
 */
const setVisitorUsername = () => {
  visitorUsername = username
  // connect to chat room when username retrieved
  connectToRoom()
  // and enable sending chat messages
  sendChatButton.addEventListener('click', sendChatText)
}




setVisitorUsername()
initChat()
getDetailsFromDbpedia(plantName.textContent).catch((err) => {
  console.error(err);
});

handleNameUpdate().catch((err) => {
  console.error(err);
});

setLocationText().then(() => null);
