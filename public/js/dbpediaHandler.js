const getDetailsFromDbpedia = async (plantName) => {
  fetch(`/dbpedia/sparqlQuery?plantName=${plantName}`)
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        // fill the dbpedia elements with the fetched data
        const plant = data[0];
        const common = document.getElementById("dbpCommonName");
        const scientific = document.getElementById("dbpScientificName");
        const description = document.getElementById("dbpDescription");
        const uri = document.getElementById("dbpURI");

        common.innerHTML  = `Common name: ${plant.commonName.value}`;
        scientific.innerHTML = `Scientific name: ${plant.scientificName.value}`;
        description.innerHTML = plant.description.value;
        uri.href = plant.plant.value
        uri.innerHTML = plant.plant.value
      }
    })
    .catch(err => {
      console.error(err);
  });
};

// use the user-defined plant name
const plantName = document.getElementById("plantName").innerHTML;
getDetailsFromDbpedia(plantName).then(() => null);
