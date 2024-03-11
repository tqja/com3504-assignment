var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/map', (req, res) => {
  res.render('map', { title: 'Map' });
});

module.exports = router;
