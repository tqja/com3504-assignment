const express = require('express');
const router = express.Router();
const { dbpediaController } = require('../controllers/dbpedia');

/** Renders the dbpedia route, and passes context to data if available from a query. */
const dbpedia = (req, res) => {
  const context = req.queryData;
  res.render('dbpedia', {title: 'DBPedia search', data: context});
}

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
