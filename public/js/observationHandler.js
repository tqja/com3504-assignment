import { getUsernameFromIDB } from "./idbHelper.js";

const plantName = document.getElementById("plantName");
const nameBtn = document.getElementById("nameBtn");
const nickname = document.getElementById("nickname").textContent;
const observationId = document.getElementById("observationId").innerHTML;

// retrieve username from indexedDB
const username = await getUsernameFromIDB();

if (username === nickname) {
  // reveal edit button for name if original poster
  nameBtn.hidden = false;

  let edit = false;
  nameBtn.addEventListener("click", () => {
    edit = !edit;
    const originalName = plantName.textContent;

    if (edit) {
      nameBtn.textContent = "Save";
      plantName.contentEditable = true;
      plantName.focus();
    } else {
      // set max length for input
      if (plantName.textContent.length > 40) {
        alert("Plant name cannot exceed 40 characters!");
      } else {
        fetch("/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            observationId: observationId,
            plantName: plantName.textContent,
          }),
        })
          .then(() => {})
          .catch(() => {
            alert("Failed to update name");
            plantName.textContent = originalName;
          });
        nameBtn.textContent = "Change name";
        plantName.contentEditable = false;
      }
    }
  });
}
