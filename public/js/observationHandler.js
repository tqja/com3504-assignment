import { getUsernameFromIDB } from "./idbHelper.js";

const plantName = document.getElementById("plantName");
const nameBtn = document.getElementById("nameBtn");
const nickname = document.getElementById("nickname").innerHTML;

// retrieve username from indexedDB
const username = await getUsernameFromIDB();

if (username === nickname) {
  // reveal edit button for name if original poster
  nameBtn.hidden = false;

  let edit = false;
  nameBtn.addEventListener("click", () => {
    edit = !edit;

    if (edit) {
      nameBtn.innerHTML = "Save";
      plantName.contentEditable = edit;
      plantName.focus();
    } else {
      // set max length for input
      if (plantName.textContent.length > 40) {
        alert("Plant name cannot exceed 40 characters!");
      } else {
        nameBtn.innerHTML = "Change name";
        plantName.contentEditable = edit;
      }
    }
  });
}
