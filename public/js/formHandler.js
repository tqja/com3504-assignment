const form = document.getElementById("form");

// submission elements
const submitDiv = document.getElementById("submitDiv");
const imageInput = document.getElementById("image");
const urlLabel = document.getElementById("urlLabel");
const urlInput = document.getElementById("imageUrl");
const mapDiv = document.getElementById("map");
const latField = document.getElementById("latitude");
const lngField = document.getElementById("longitude");
latLabel = document.getElementById("latLabel");
lngLabel = document.getElementById("lngLabel");

// preview elements
const previewDiv = document.getElementById("previewDiv");
const previewImage = document.getElementById("previewImage");

// when the url input updates, check if the url/image is valid and display
urlInput.addEventListener("input", () => {
  // get url input and trim whitespace
  const imgUrl = urlInput.value.trim();

  if (validURL(imgUrl)) {
    // construct image element to test if URL links to an image
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      // add url to src and switch to preview
      previewImage.src = imgUrl;
      toggleImgDivs();
    };
  }
});

// when the file upload input changes, add the image to the preview and toggle to the preview
imageInput.addEventListener("change", (e) => {
  const imageUpload = e.target.files[0];

  if (imageUpload) {
    // create object URL for preview image and set to preview
    previewImage.src = URL.createObjectURL(imageUpload);
    toggleImgDivs();
  }
});

// form validation for image input
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // check if both image inputs are empty or submitDiv is visible
  if (
    (!imageInput.files[0] && !urlInput.value) ||
    !submitDiv.classList.contains("hidden")
  ) {
    alert("Please upload or link a URL to a photo");
  } else {
    form.submit();
  }
});

/**
 * Clears the image preview/inputs and switches back to submit div
 */
const cancelUpload = () => {
  // clear values
  URL.revokeObjectURL(previewImage.src);
  previewImage.src = "";
  urlInput.value = "";
  imageInput.value = null;
  // toggle to submitDiv
  toggleImgDivs();
};

/**
 * Checks if a given URL is correctly formed.
 * @param url The URL to validate
 * @returns {boolean} Whether or not the URL is valid
 */
const validURL = (url) => {
  try {
    new URL(url);
    // url is correctly formed
    urlInput.style.border = "1px solid #ced4da";
    return true;
  } catch {
    urlInput.style.border = "1px solid red";
    // url invalid
    return false;
  }
};

/** Toggles the hidden class on the image submission/preview divs. */
const toggleImgDivs = () => {
  if (submitDiv.classList.contains("hidden")) {
    submitDiv.classList.remove("hidden");
    previewDiv.classList.add("hidden");
  } else {
    submitDiv.classList.add("hidden");
    previewDiv.classList.remove("hidden");
  }
};

// set the current date and time as the default value
const date = new Date();
document.getElementById("dateSeen").value = date.toISOString().slice(0, 16);

// hide elements that require offline, show lat/lng for manual input
if (typeof navigator !== "undefined" && !navigator.onLine) {
  urlLabel.classList.add("hidden");
  urlInput.classList.add("hidden");
  mapDiv.classList.add("hidden");
  latField.type = "text";
  lngField.type = "text";
  latLabel.classList.remove("hidden");
  lngLabel.classList.remove("hidden");
}
