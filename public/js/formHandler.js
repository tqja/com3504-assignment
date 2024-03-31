const form = document.getElementById("form");

// submission elements
const submitDiv = document.getElementById("submitDiv");
const imageInput = document.getElementById("image");
const urlInput = document.getElementById("imageUrl");

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
    // switch to preview
    toggleImgDivs();
  }
});

// form validation for image input
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // check if both image inputs are empty
  if (!imageInput.files[0] && !urlInput.value) {
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
    return true;
  } catch {
    // url invalid
    return false;
  }
};

/** Toggles the hidden attribute on the image submission/preview divs. */
const toggleImgDivs = () => {
  submitDiv.hidden = !submitDiv.hidden;
  previewDiv.hidden = !previewDiv.hidden;
};
