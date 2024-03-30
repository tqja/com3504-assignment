const express = require('express');
const router = express.Router();
const { dbpediaController } = require('../controllers/dbpedia');

/** Makes a SPARQL query to DBPedia. Retrieves data if successful, or an empty array otherwise. */
const sparqlQuery = (req, res) => {
  dbpediaController(req, res)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch data" })
    });
}

router.get('/sparqlQuery', sparqlQuery);

module.exports = router;
