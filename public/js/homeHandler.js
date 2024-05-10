const sidebar = document.getElementById("sidebar");
const grid = document.getElementById("photo-grid");
const sidebarBtn = document.getElementById("sidebarBtn");

/** Toggles the hidden class for the sidebar and grid. */
const toggleSidebar = () => {
  sidebarBtn.textContent =
      sidebarBtn.textContent === "Sort/Filter" ? "Close" : "Sort/Filter";
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
        updatePhotoGrid(data);
      });
}

/**
 * Updates the photo grid with data from a data object.
 * @param data The data to update the photo grid with.
 */
function updatePhotoGrid(data) {
  const photoGrid = document.querySelector("#photo-grid");
  photoGrid.innerHTML = ""; // Clear existing content

  if (data.length === 0) {
    photoGrid.innerHTML = "<p class='text-center'>No results found.</p>";
    return;
  }

  data.forEach((observation) => {
    const photoItem = document.createElement("div");
    photoItem.className = "photo-item";
    let post = `
      <div class="w-screen h-auto drop-shadow-xl lg:w-56 lg:rounded 2xl:w-64">
        <a href="/observations/${observation._id}">
          <img src="${observation.image}" alt="Image of a plant"
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
    post += `</div></div></a></div>`;
    photoItem.innerHTML = post;
    photoGrid.appendChild(photoItem);
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

document.getElementById('sort-by').addEventListener('change', function () {
  if (this.value === 'closest-to') {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const url = `/sort-by-distance?latitude=${latitude}&longitude=${longitude}`;
      const response = await fetch(url);
      const sortedData = await response.json();
      // Update your page elements with sortedData
      console.log(sortedData);  // Implement display logic based on your app's setup
    }, (err) => {
      console.error(err);
      alert('Unable to retrieve location');
    });
  }
});

function applyFilters() {
  const color = document.getElementById('colour').value;
  const flowering = document.querySelector('input[name="flowers"]:checked').value;
  const soil = document.getElementById('soil').value;
  const sunlight = document.getElementById('sunlight').value;
  const leafy = document.querySelector('input[name="leaves"]:checked').value;
  const fragrant = document.querySelector('input[name="fragrance"]:checked').value;
  const fruiting = document.querySelector('input[name="fruit"]:checked').value;
  const native = document.querySelector('input[name="native"]:checked').value;

  let queryParams = [];

  if (color !== 'Any') queryParams.push(`color=${color}`);
  if (flowering !== 'no-preference') queryParams.push(`flowering=${flowering}`);
  if (soil !== 'no-preference') queryParams.push(`soil=${soil}`);
  if (sunlight !== 'no-preference') queryParams.push(`sunlight=${sunlight}`);
  if (leafy !== 'no-preference') queryParams.push(`leafy=${leafy}`);
  if (fragrant !== 'no-preference') queryParams.push(`fragrant=${fragrant}`);
  if (fruiting !== 'no-preference') queryParams.push(`fruiting=${fruiting}`);
  if (native !== 'no-preference') queryParams.push(`native=${native}`);

  const queryString = queryParams.join('&');

  fetch(`/filter?${queryString}`)
      .then(response => response.json())
      .then(data => {
        updatePhotoGrid(data);
      });
}



// Add event listeners to the filter inputs
document.getElementById('colour').addEventListener('change', applyFilters);
document.querySelectorAll('input[name="flowers"]').forEach(input => {
  input.addEventListener('change', applyFilters);
});
document.getElementById('soil').addEventListener('change', applyFilters);
document.getElementById('sunlight').addEventListener('change', applyFilters);
document.querySelectorAll('input[name="leaves"]').forEach(input => {
  input.addEventListener('change', applyFilters);
});
document.querySelectorAll('input[name="fragrance"]').forEach(input => {
  input.addEventListener('change', applyFilters);
});
document.querySelectorAll('input[name="fruit"]').forEach(input => {
  input.addEventListener('change', applyFilters);
});
document.querySelectorAll('input[name="native"]').forEach(input => {
  input.addEventListener('change', applyFilters);
});

