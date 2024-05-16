const sidebar = document.getElementById("sidebar");
const grid = document.getElementById("photo-grid");
const sidebarBtn = document.getElementById("sidebarBtn");
const sortSpinner = document.getElementById("sortSpinner");
const sortInput = document.getElementById("sortInput");

let username = "undefined";
getUsernameFromIDB()
    .then((u) => {
      username = u;
    })
    .catch((err) => {
      console.error(err);
    });

/** Toggles the hidden class for the sidebar and grid. */
const toggleSidebar = () => {
  sidebarBtn.textContent =
    sidebarBtn.textContent.trim() === "Sort/Filter" ? "Close" : "Sort/Filter";
  sidebar.classList.toggle("hidden");
  grid.classList.toggle("hidden");
};

/**
 * Fetches a sorted data object and updates the photo grid.
 * @param observations - The observations to sort
 */
function sortPlants(observations) {
  return observations.then((obs) => {
    const sortBy = sortInput.value;
    const [sortField, sortOrder] = sortBy.split("-");
    if (sortField === "dateSeen") {
      if (sortOrder === "asc") {
        return obs.sort((a, b) => {
          const d1 = new Date(a.dateSeen);
          const d2 = new Date(b.dateSeen);
          return d1 - d2;
        });
      } else {
        return obs.sort((a, b) => {
          const d1 = new Date(a.dateSeen);
          const d2 = new Date(b.dateSeen);
          return d2 - d1;
        });
      }
    } else {
      sortInput.disabled = true;
      sortSpinner.classList.remove("hidden");
      console.log("distance");

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // hide the spinner after location acquired
            sortSpinner.classList.add("hidden");
            sortInput.disabled = false;
            const { latitude, longitude } = position.coords;
            const sortedObs = obs.sort((a, b) => {
              const aLatDiff = a.location.latitude - latitude;
              const aLngDiff = a.location.longitude - longitude;
              const bLatDiff = b.location.latitude - latitude;
              const bLngDiff = b.location.longitude - longitude;
              const aDist = Math.sqrt(aLatDiff ** 2 + aLngDiff ** 2);
              const bDist = Math.sqrt(bLatDiff ** 2 + bLngDiff ** 2);
              return sortField === "closest" ? aDist - bDist : bDist - aDist;
            });
            resolve(sortedObs);
          },
          (err) => {
            // hide the spinner if fetching location fails
            sortSpinner.classList.add("hidden");
            // enable input after failure
            sortInput.disabled = false;
            console.error("Error retrieving location:", err);
            alert("Unable to retrieve location");
            reject(err);
          },
        );
      });
    }
  });
}

/**
 * Updates the photo grid with data from a data object.
 */
function updatePhotoGrid() {
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
  sortPlants(applyFilters()).then((obs) => {
    const postElems = createPostElements(obs);

    if (postElems.length === 0) {
      grid.innerHTML = `<p class='text-center text-2xl text-gray-600 font-semibold'>No results found.</p>`;
    }
    postElems.forEach((photoItem) => grid.appendChild(photoItem));
    if (sidebarBtn.textContent.trim() !== "Close") {
      grid.classList.remove("hidden");
    }
  });
}

function createPostElements(observations) {
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

    let syncN = false;
    if (typeof observation._id === "number") {
      syncN = true;
    }

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
  updatePhotoGrid();
});

function applyFilters() {
  const myObservation = document.getElementById("my-observations").value;
  console.log(myObservation);
  const colour = document.getElementById("colour").value;
  const flowering = document.querySelector(
    'input[name="flowers"]:checked',
  ).value;
  const soilType = document.getElementById("soil").value;
  const sunlight = document.getElementById("sunlight").value;
  const leafy = document.querySelector('input[name="leaves"]:checked').value;
  const fragrant = document.querySelector(
    'input[name="fragrance"]:checked',
  ).value;
  const fruiting = document.querySelector('input[name="fruit"]:checked').value;
  const native = document.querySelector('input[name="native"]:checked').value;
  const status = document.querySelector('input[name="status"]:checked').value;

  const filters = {
    myObservation: myObservation,
    colour: colour,
    flowering: flowering,
    soilType: soilType,
    sunlight: sunlight,
    leafy: leafy,
    fragrant: fragrant,
    fruiting: fruiting,
    native: native,
    status: status,
  };

  return Promise.all([
    openObservationsIDB().then((db) =>
      getFilteredObservations(db, username, filters, "observations"),
    ),
    openNSyncObservationsIDB().then((ndb) =>
      getFilteredObservations(ndb, username, filters, "new-sync-observations"),
    ),
  ]).then(([obs, syncObs]) => {
    return obs.concat(syncObs);
  });
}

// Add event listeners to the filter inputs
document.getElementById("colour").addEventListener("change", updatePhotoGrid);
document.getElementById("my-observations").addEventListener("change", updatePhotoGrid);

document.querySelectorAll('input[name="flowers"]').forEach((input) => {
  input.addEventListener("change", updatePhotoGrid);
});
document.getElementById("soil").addEventListener("change", updatePhotoGrid);
document.getElementById("sunlight").addEventListener("change", updatePhotoGrid);
document.querySelectorAll('input[name="leaves"]').forEach((input) => {
  input.addEventListener("change", updatePhotoGrid);
});
document.querySelectorAll('input[name="fragrance"]').forEach((input) => {
  input.addEventListener("change", updatePhotoGrid);
});
document.querySelectorAll('input[name="fruit"]').forEach((input) => {
  input.addEventListener("change", updatePhotoGrid);
});
document.querySelectorAll('input[name="native"]').forEach((input) => {
  input.addEventListener("change", updatePhotoGrid);
});
document.querySelectorAll('input[name="status"]').forEach((input) => {
  input.addEventListener("change", updatePhotoGrid);
});


async function syncObservations() {
  const localObservations = await openObservationsIDB().then((db) =>
    getAllObservations(db),
  );
  const remoteObservations = await fetch("/allObservations").then(
    (observations) => observations.json(),
  );

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

      if (
        localObservation.chat_history.length !==
        remoteObservation.chat_history.length
      ) {
        const mergedChatHistory = mergeChatHistories(
          localObservation.chat_history,
          remoteObservation.chat_history,
        );
        localObservation.chat_history = mergedChatHistory;
        updateData.chat_history = mergedChatHistory;
      }

      if (Object.keys(updateData).length > 1) {
        console.log(updateData);
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

async function mergeChatHistories(localHistory, remoteHistory) {
  return [...localHistory, ...remoteHistory];
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
      updatePhotoGrid();
    });
  } else {
    updatePhotoGrid();
  }
};
