// submission elements
const submitDiv = document.getElementById("submitDiv");
const imageInput = document.getElementById("image");
const urlInput = document.getElementById("imageUrl");

// preview elements
const previewDiv = document.getElementById("previewDiv");
const cancelBtn = document.getElementById("cancelImage");

// when the url input updates, check if the url/image is valid and display
urlInput.addEventListener("input", () => {
  // get url input and trim whitespace
  const imgUrl = urlInput.value.trim();

  if (validURL(imgUrl)) {
    // construct image element
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      // insert into preview and switch to preview
      previewDiv.insertBefore(image, cancelBtn);
      toggleImgDivs();
    };
  }
});

// when the file upload input changes, add the image to the preview and toggle to the preview
imageInput.addEventListener("change", (e) => {
  const imageUpload = e.target.files[0];

  if (imageUpload) {
    // create object URL for preview image
    const imgUrl = URL.createObjectURL(imageUpload);

    // construct image element
    const image = new Image();
    image.src = imgUrl;

    // insert into preview and switch to preview
    previewDiv.insertBefore(image, cancelBtn);
    toggleImgDivs();
  }
});

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
