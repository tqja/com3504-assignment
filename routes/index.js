var express = require('express');
var router = express.Router();

const model = require('../models/observations');

/* GET home page. */
router.get('/', function(req, res) {
  console.log(
      new model({
        posterNickname: "a",
        image: 1,
        name: "a",
        //status:
        dateSeen: Date.now(),
        description: "a",
        location: {latitude: 1, longitude: 1},
        comments: [{username: "a", comment: "a", timestamp: Date.now()}],
        height: 1,
        spread: 1,
        sunlight: "NA",
        soil_type: "NA",
      })
  )
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
  console.log(req.body);
  res.render('partials/observationForm', { title: 'Express' });
});

module.exports = router;
