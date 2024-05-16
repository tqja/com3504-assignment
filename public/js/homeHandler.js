const sidebar = document.getElementById("sidebar");
const grid = document.getElementById("photo-grid");
const sidebarBtn = document.getElementById("sidebarBtn");
const sortSpinner = document.getElementById("sortSpinner");
const sortInput = document.getElementById("sortInput");

/** Toggles the hidden class for the sidebar and grid. */
const toggleSidebar = () => {
  sidebarBtn.textContent =
    sidebarBtn.textContent.trim() === "Sort/Filter" ? "Close" : "Sort/Filter";
  sidebar.classList.toggle("hidden");
  grid.classList.toggle("hidden");
};

/**
 * Fetches a sorted data object and updates the photo grid.
 * @param sortBy - The metric to sort by.
 */
function sortPlants(sortBy) {
  const [sortField, sortOrder] = sortBy.split("-");
  fetch(`/sort?field=${sortField}&order=${sortOrder}`)
    .then((response) => response.json())
    .then((data) => {
      updatePhotoGrid(createPostElements(data));
    });
}

/**
 * Updates the photo grid with data from a data object.
 * @param photoItems The data to update the photo grid with.
 */
function updatePhotoGrid(photoItems) {
  grid.classList.add(
    "grid",
    "mx-auto",
    "w-auto",
    "lg:p-4",
    "2xl:p-6",
    "gap-4",
    "grid-cols-1",
    "lg:grid-cols-3",
    "2xl:grid-cols-4",
    `grid-rows-${length}`,
    `lg:grid-rows-${Math.max(Math.ceil(length / 3), 4)}`,
    `2xl:grid-rows-${Math.max(Math.ceil(length / 4), 4)}`,
    "hidden",
  );
  grid.innerHTML = ""; // Clear existing content

  if (photoItems.length === 0) {
    grid.innerHTML = `<p class='text-center text-2xl text-gray-600 font-semibold'>No results found.</p>`;
  }

  photoItems.forEach((photoItem) => grid.appendChild(photoItem));
  if (sidebarBtn.textContent.trim() !== "Close") {
    grid.classList.remove("hidden");
  }
}

function createPostElements(observations, syncN = false) {
  return observations.map((observation) => {
    const photoItem = document.createElement("div");
    photoItem.classList.add(
      "w-screen",
      "h-auto",
      "drop-shadow-xl",
      "lg:w-56",
      "lg:rounded",
      "2xl:w-64",
    );

    let url = `/observations?id=${observation._id}`;
    if (syncN) {
      url = url.concat("&syncN");
    }

    let src;
    if (syncN) {
      src = URL.createObjectURL(observation.image);
    } else {
      src = observation.image;
    }

    let post = `
    <a href=${url}>
      <img src=${src} alt="Image of a plant"
         class="object-cover aspect-square h-auto w-screen lg:h-56 lg:w-56 lg:rounded-t 2xl:h-64 2xl:w-64">
      <div class="font-semibold text-center py-2 bg-white w-auto lg:mb-0 lg:w-56 2xl:w-64">
        <h2 class="photo-description overflow-hidden">${observation.name}</h2>
        <div class="flex flex-wrap justify-between items-center mx-2 pt-2 border-t-2 border-gray-300 mt-1">
          <div class="flex items-center">
            <i class="fa-regular fa-user mr-1"></i>
            <span id="nickname" class="text-xs">${observation.nickname}</span>
          </div>`;

    if (observation.status === "In_progress") {
      post += `
        <div class="flex items-center">
          <span id="statusDot" class="inline-block h-3 w-3 mr-1 rounded-full bg-amber-400"></span>
          <span id="status" class="text-xs">In progress</span>
        </div>`;
    } else {
      post += `
        <div class="flex items-center">
          <span class="inline-block h-3 w-3 mr-1 rounded-full bg-green-400"></span>
          <span id="status" class="text-xs">Completed</span>
        </div>`;
    }
    post += `</div></div></a>`;
    photoItem.innerHTML = post;
    return photoItem;
  });
}

// ensure the correct content is displayed when the breakpoints are reached
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    // ensure the grid is showing if it is currently hidden
    if (grid.classList.contains("hidden")) {
      grid.classList.toggle("hidden");
    }
  } else {
    // ensure the grid is hidden if it is showing and the sidebar is showing
    if (!sidebar.classList.contains("hidden")) {
      if (!grid.classList.contains("hidden")) {
        grid.classList.toggle("hidden");
      }
    }
  }
});

sortInput.addEventListener("change", function () {
  if (this.value.startsWith("closest") || this.value.startsWith("furthest")) {
    // disable the input until finished loading new photo grid
    sortInput.disabled = true;

    // show the loading spinner until the location is acquired
    sortSpinner.classList.remove("hidden");
    const order = this.value.split("-")[0]; // "closest" or "furthest"
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // hide the spinner after location acquired
        sortSpinner.classList.add("hidden");
        const { latitude, longitude } = position.coords;
        const url = `/sort-by-distance?latitude=${latitude}&longitude=${longitude}&order=${order}`;
        const response = await fetch(url);
        const sortedData = await response.json();
        updatePhotoGrid(createPostElements(sortedData));
        // enable input after update
        sortInput.disabled = false;
      },
      (err) => {
        // hide the spinner if fetching location fails
        sortSpinner.classList.add("hidden");
        // enable input after failure
        sortInput.disabled = false;
        console.error("Error retrieving location:", err);
        alert("Unable to retrieve location");
      },
    );
  } else {
    sortPlants(this.value);
  }
});

function applyFilters() {
  const color = document.getElementById("colour").value;
  const flowering = document.querySelector(
    'input[name="flowers"]:checked',
  ).value;
  const soil = document.getElementById("soil").value;
  const sunlight = document.getElementById("sunlight").value;
  const leafy = document.querySelector('input[name="leaves"]:checked').value;
  const fragrant = document.querySelector(
    'input[name="fragrance"]:checked',
  ).value;
  const fruiting = document.querySelector('input[name="fruit"]:checked').value;
  const native = document.querySelector('input[name="native"]:checked').value;
  const status = document.querySelector('input[name="status"]:checked').value;
  let queryParams = [];

  if (color !== "Any") queryParams.push(`color=${color}`);
  if (status !== "no-preference") queryParams.push(`status=${status}`);
  if (flowering !== "no-preference") queryParams.push(`flowering=${flowering}`);
  if (soil !== "no-preference") queryParams.push(`soil=${soil}`);
  if (sunlight !== "no-preference") queryParams.push(`sunlight=${sunlight}`);
  if (leafy !== "no-preference") queryParams.push(`leafy=${leafy}`);
  if (fragrant !== "no-preference") queryParams.push(`fragrant=${fragrant}`);
  if (fruiting !== "no-preference") queryParams.push(`fruiting=${fruiting}`);
  if (native !== "no-preference") queryParams.push(`native=${native}`);

  const queryString = queryParams.join("&");

  fetch(`/filter?${queryString}`)
    .then((response) => response.json())
    .then((data) => {
      updatePhotoGrid(createPostElements(data));
    });
}

// Add event listeners to the filter inputs
document.getElementById("colour").addEventListener("change", applyFilters);
document.querySelectorAll('input[name="flowers"]').forEach((input) => {
  input.addEventListener("change", applyFilters);
});
document.getElementById("soil").addEventListener("change", applyFilters);
document.getElementById("sunlight").addEventListener("change", applyFilters);
document.querySelectorAll('input[name="leaves"]').forEach((input) => {
  input.addEventListener("change", applyFilters);
});
document.querySelectorAll('input[name="fragrance"]').forEach((input) => {
  input.addEventListener("change", applyFilters);
});
document.querySelectorAll('input[name="fruit"]').forEach((input) => {
  input.addEventListener("change", applyFilters);
});
document.querySelectorAll('input[name="native"]').forEach((input) => {
  input.addEventListener("change", applyFilters);
});
document.querySelectorAll('input[name="status"]').forEach((input) => {
  input.addEventListener("change", applyFilters);
});

async function syncObservations() {
  const localObservations = await openObservationsIDB().then((db) =>
    getAllObservations(db),
  );
  const newObservations = await openNSyncObservationsIDB().then((db) =>
    getAllNSyncObservations(db),
  );
  const remoteObservations = await fetch("/allObservations").then(
    (observations) => observations.json(),
  );
  const username = await getUsernameFromIDB();

  localObservations.forEach((localObservation) => {
    let updateData = { id: localObservation._id };
    const remoteObservation = remoteObservations.find(
      (remote) => remote._id === localObservation._id,
    );
    if (remoteObservation) {
      if (localObservation.name !== remoteObservation.name) {
        if (localObservation.username === username) {
          updateData.name = localObservation.name;
        } else {
          localObservation.name = remoteObservation.name;
        }
      }

      if (localObservation.status !== remoteObservation.status) {
        if (localObservation.username === username) {
          updateData.status = localObservation.status;
        } else {
          localObservation.status = remoteObservation.status;
        }
      }

      const mergedChatHistory = mergeChatHistories(
        localObservation.chat_history,
        remoteObservation.chat_history,
      );
      if (mergedChatHistory) {
        localObservation.chat_history = mergedChatHistory;
        updateData.chat_history = mergedChatHistory;
      }

      if (Object.keys(updateData).length > 1) {
        fetch("/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response not ok");
            }
            return response;
          })
          .then(() => {
            openObservationsIDB().then((db) =>
              updateObservation(db, localObservation),
            );
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  });

  const localObservationIDs = new Set(
    localObservations.map((observation) => observation._id),
  );
  const newRemoteObservations = remoteObservations.filter(
    (remoteObservation) => !localObservationIDs.has(remoteObservation._id),
  );
  newRemoteObservations.forEach((observation) => {
    openObservationsIDB().then((db) => {
      addObservation(db, observation);
    });
  });

  return await openObservationsIDB().then((db) => getAllObservations(db));
}

function mergeChatHistories(localHistory, remoteHistory) {
  const merged = [...localHistory, ...remoteHistory];
  const uniqueTimestamps = new Set();
  const uniqueMessages = merged.filter((msg) => {
    if (!uniqueTimestamps.has(msg.timestamp)) {
      uniqueTimestamps.add(msg.timestamp);
      return true;
    }
    return false;
  });

  uniqueMessages.sort((a, b) => a.timestamp - b.timestamp);
  if (uniqueMessages.length > localHistory.length) {
    return uniqueMessages;
  } else {
    return false;
  }
}

window.onload = function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(function (registration) {
        console.log("Service Worker Registered!", registration);
      })
      .catch(function (err) {
        console.log("Service Worker registration failed: ", err);
      });
  }

  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      // Notification permission granted
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
            serviceWorkerRegistration
              .showNotification("floraExplorer", {
                body: "Notifications are enabled!",
              })
              .then((r) => {
                console.log(r);
              });
          });
        }
      });
    }
  }

  if (navigator.onLine) {
    syncObservations().then((observations) => {
      updatePhotoGrid(createPostElements(observations));
      sortPlants(sortInput.value);
    });
  } else {
    Promise.all([
      openObservationsIDB().then((db) => getAllObservations(db)),
      openNSyncObservationsIDB().then((ndb) => getAllNSyncObservations(ndb)),
    ])
      .then(([observations, nSyncObservations]) => {
        let postElems = createPostElements(observations);
        let NPostElems = createPostElements(nSyncObservations, true);
        updatePhotoGrid(postElems.concat(NPostElems));
        // TODO: sorting offline!
        // sortPlants(sortInput.value);
      })
      .catch((error) => {
        console.error("Error fetching data from IndexedDB:", error);
      });
  }
};
