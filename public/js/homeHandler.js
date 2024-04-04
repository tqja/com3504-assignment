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
  data.forEach((observation) => {
    const photoItem = document.createElement("div");
    photoItem.className = "photo-item";
    photoItem.innerHTML = `
        <div class="w-screen drop-shadow-xl lg:w-56 lg:rounded 2xl:w-64">
            <a href="/observations/${observation._id}">
              <img src="${observation.image}" alt="Image of a plant" class="object-cover aspect-square h-auto w-screen lg:h-56 lg:w-56 lg:rounded-t 2xl:h-64 2xl:w-64">
              <div class="font-semibold text-center py-2 bg-white w-auto lg:mb-0 lg:w-56 2xl:w-64">
                <span class="photo-description">${observation.name}</span>
              </div>
            </a>
      `;
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
