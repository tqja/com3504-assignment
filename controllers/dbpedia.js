const { fetchFromDbpedia } = require('../models/dbpedia');

/** Controller to fetch DBPedia data from controller and serve to route */
const dbpediaController = (req) => {
  const plantName = req.query.plantName;
  return new Promise((resolve, reject) => {
    fetchFromDbpedia(plantName).then(data => {
      resolve(data)
    }).catch(err => {
      reject(err);
    });
  });
}

module.exports = { dbpediaController }
