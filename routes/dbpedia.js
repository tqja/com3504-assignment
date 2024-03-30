const express = require('express');
const router = express.Router();
const { dbpediaController } = require('../controllers/dbpedia');

/** Makes a SPARQL query to DBPedia. Retrieves data if successful, or an empty array otherwise. */
const sparqlQuery = (req, res, next) => {
  dbpediaController(req, res)
    .then(data => {
      req.queryData = data;
    }).then(() => {
      next();
    }
    ).catch(err => {
      console.error(err);
      req.queryData = [];
      next();
    });
}

router.get('/', dbpedia);
router.get('/sparqlQuery', sparqlQuery, dbpedia);

module.exports = router;
