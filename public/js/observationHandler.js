import { getUsernameFromIDB } from "./idbHelper.js";

const dbpediaDiv = document.getElementById("dbpedia");
const plantName = document.getElementById("plantName");
const nameBtn = document.getElementById("nameBtn");
const nickname = document.getElementById("nickname").textContent;
const observationId = document.getElementById("observationId").innerHTML;

// retrieve username from indexedDB
const username = await getUsernameFromIDB();
/**
 * Attempts to fetch a plant matching the name from DBPedia and fill the div with information.
 * @param plantName The plant to try and fetch information about
 * @returns {Promise<void>}
 */
const getDetailsFromDbpedia = async (plantName) => {
  fetch(`/dbpedia/sparqlQuery?plantName=${plantName}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data[0]) {
        // fill the dbpedia elements with the fetched data
        const plant = data[0];
        const common = document.getElementById("dbpCommonName");
        const scientific = document.getElementById("dbpScientificName");
        const description = document.getElementById("dbpDescription");
        const uri = document.getElementById("dbpURI");

        common.textContent = `Common name: ${plant.commonName.value}`;
        scientific.textContent = `Scientific name: ${plant.scientificName.value}`;
        description.textContent = plant.description.value;
        uri.href = plant.plant.value;
        uri.textContent = plant.plant.value;

        // reveal the div
        dbpediaDiv.hidden = false;
      } else {
        // hide div if query failed (name not found)
        dbpediaDiv.hidden = true;
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
        // post new name to edit route
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
getDetailsFromDbpedia(plantName.textContent).catch((err) => {
  console.error(err);
});

