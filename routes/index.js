var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
  console.log(req.body);
  res.render('partials/observationForm', { title: 'Express' });
});

module.exports = router;
