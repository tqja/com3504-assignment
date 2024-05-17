const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const syncN = params.has("syncN");
let observation;

let socket = io();
console.log(socket);
const chatButton = document.getElementById("chat-send");
let chatInput = document.getElementById("chat-input");

const dbpediaDiv = document.getElementById("dbpedia");
const dbpPlaceholder = document.getElementById("dbpPlaceholder");
const plantName = document.getElementById("plantName");
const nameBtn = document.getElementById("nameBtn");
const nameInput = document.getElementById("nameInput");
const nickname = document.getElementById("nickname");
const statusBtn = document.getElementById("statusBtn");
const latitude = document.getElementById("lat");
const longitude = document.getElementById("lng");
const messagesElem = document.getElementById("messages");
const locationText = document.getElementById("location");

let username = "undefined";
getUsernameFromIDB()
  .then((u) => {
    username = u;
  })
  .catch((err) => {
    console.error(err);
  });

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

        common.textContent = "Common Name: " + plant.commonName.value;
        scientific.textContent =
          "Scientific name: " + plant.scientificName.value;
        description.textContent = plant.description.value;
        uri.href = plant.plant.value;
        uri.textContent = plant.plant.value;

        // reveal the div
        dbpediaDiv.hidden = false;
        dbpPlaceholder.hidden = true;
      } else {
        // hide div if query failed (name not found)
        dbpediaDiv.hidden = true;
        dbpPlaceholder.hidden = false;
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
            id: id,
            plantName: nameInput.value,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response not ok");
            }
            return response;
          })
          .then(() => {
            observation.name = nameInput.value;
            openObservationsIDB().then((db) => {
              updateObservation(db, observation).then(() => {
                getDetailsFromDbpedia(nameInput.value);
                plantName.textContent = nameInput.value;
              });
            });
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
  const lat = parseFloat(latitude.textContent);
  const lng = normaliseLng(parseFloat(longitude.textContent));
  const data = navigator.onLine ? await reverseGeocode(lat, lng) : null;
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

const createObservationElem = () => {
  plantName.textContent = observation.name;
  nickname.textContent = observation.nickname;

  const statusSpan = document.getElementById("statusSpan");
  if (observation.status === "In_progress") {
    statusSpan.innerHTML += `
    <span id="statusDot" class='inline-block h-3 w-3 mr-2 mt-1 rounded-full bg-amber-400'></span>
    <span id="status">In progress</span>`;
  } else {
    statusSpan.innerHTML += `
    <span class='inline-block h-3 w-3 mr-2 mt-1 rounded-full bg-green-400'></span>
    <span id="status">Completed</span>`;
    chatInput.disabled = true;
    chatButton.hidden = true;
  }

  let src;
  if (syncN) {
    src = URL.createObjectURL(observation.image);
  } else {
    src = observation.image;
  }
  const image = document.getElementById("image");
  image.src = src;
  image.alt = `Photograph of ${observation.name}`;

  document.getElementById("dateSeen").textContent = new Date(
    observation.dateSeen,
  ).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
    hourCycle: "h12",
  });

  latitude.textContent = observation.location.latitude;
  longitude.textContent = observation.location.longitude;

  document.getElementById("description").textContent = observation.description;

  document.getElementById("colour").textContent += observation.colour;
  document.getElementById("height").textContent += observation.height;
  document.getElementById("spread").textContent += observation.spread;
  document.getElementById("sunlight").textContent += observation.sunlight;
  document.getElementById("soilType").textContent += observation.soilType;
  document.getElementById("flowering").textContent += observation.flowering
    ? "Yes"
    : "No";
  document.getElementById("leafy").textContent += observation.leafy
    ? "Yes"
    : "No";
  document.getElementById("fragrant").textContent += observation.fragrant
    ? "Yes"
    : "No";
  document.getElementById("fruiting").textContent += observation.fruiting
    ? "Yes"
    : "No";
  document.getElementById("native").textContent += observation.native
    ? "Yes"
    : "No";

  messagesElem.textContent = JSON.stringify(observation.chat_history);
};

const updateStatusElements = () => {
  const statusDot = document.getElementById("statusDot");
  statusDot.classList.remove("bg-amber-400");
  statusDot.classList.add("bg-green-400");
  const status = document.getElementById("status");
  status.textContent = "Completed";
  chatInput.disabled = true;
  chatButton.hidden = true;
  statusBtn.remove();
  nameBtn.remove();
  nameInput.remove();
};

statusBtn.addEventListener("click", () => {
  // post to edit route
  if (navigator.onLine) {
    fetch("/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        status: "Completed",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        return response;
      })
      .then(() => {
        openObservationsIDB().then((db) => {
          observation.status = "Completed";
          updateObservation(db, observation).then(() => {
            updateStatusElements();
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    observation.status = "Completed";
    if (syncN) {
      openNSyncObservationsIDB().then((db) => {
        updateNSyncObservation(db, observation).then(() => {
          updateStatusElements();
        });
      });
    } else {
      openObservationsIDB().then((db) => {
        updateObservation(db, observation).then(() => {
          updateStatusElements();
        });
      });
    }
  }
});

const initChat = () => {
  // print chat history stored in MongoDB
  let messages = JSON.parse(messagesElem.textContent);

  messages.forEach((message) => {
    let chat_username = message.chat_username;
    let chat_text = message.chat_text;
    writeOnHistory("<b>" + chat_username + "</b>" + ": " + chat_text);
  });

  // called when a message is received
  if (navigator.onLine) {
    console.log("KHFKHJFKJAEFLKJLAJF");
    socket.emit("create or join", id, username);
  }
  chatButton.addEventListener("click", sendChatText);
};

/**
 * Gets the text to send from the interface and sends the message via socket
 */
const sendChatText = async () => {
  if (chatInput.value) {
    const chat = {
      observationID: id,
      chat_username: username,
      chat_text: chatInput.value,
      time: Date.now(),
    };

    if (navigator.onLine) {
      console.log("emitting chat", socket.connected);
      socket.emit(
        "chat",
        chat.observationID,
        chat.chat_username,
        chat.chat_text,
      );
      const updatedObservation = await fetch("/add-chat", {
        method: "POST",
        body: JSON.stringify(chat),
        headers: { "Content-Type": "application/json" },
      }).then((res) => {
        return res.json();
      });
      openObservationsIDB().then((db) => {
        updateObservation(db, updatedObservation);
      });
    } else {
      writeOnHistory("<b>" + username + ":</b> " + chat.chat_text);
      delete chat.observationID;
      observation.chat_history.push(chat);
      if (syncN) {
        openNSyncObservationsIDB().then((db) => {
          updateNSyncObservation(db, observation);
        });
      } else {
        openObservationsIDB().then((db) => {
          updateObservation(db, observation);
        });
      }
    }
  }
};

chatInput.addEventListener("keyup", (e) => {
  if (e.key !== "Enter") {
    return;
  }
  console.log("keyup");
  sendChatText();
  e.preventDefault();
});

/**
 * Appends the given text to the history div.
 * @param text
 */
const writeOnHistory = (text) => {
  let history = document.getElementById("history");
  let paragraph = document.createElement("p");
  paragraph.classList.add("break-all", "overflow-auto");
  paragraph.innerHTML = text;
  history.appendChild(paragraph);
  chatInput.value = "";
};

let promise;
if (syncN) {
  promise = openNSyncObservationsIDB().then((db) => {
    return getNSyncObservation(db, parseInt(id));
  });
} else {
  promise = openObservationsIDB().then((db) => getObservation(db, id));
}

promise.then((retrievedObservation) => {
  observation = retrievedObservation;
  console.log(observation)
  createObservationElem();

  initChat();

  if (
    username === nickname.textContent &&
    document.getElementById("status").textContent === "In progress"
  ) {
    // reveal status button if original poster
    nameBtn.hidden = false;
    statusBtn.hidden = false;
  }

  setLocationText().then(() => null);

  getDetailsFromDbpedia(plantName.textContent).catch((err) => {
    console.error(err);
  });

  if (username === nickname.textContent) {
    handleNameUpdate().catch((err) => {
      console.error(err);
    });
  }
});

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("chat", (room, username, chat) => {
  writeOnHistory("<b>" + username + "</b>" + ": " + chat);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});
