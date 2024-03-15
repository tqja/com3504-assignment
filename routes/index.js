var express = require('express');
var router = express.Router();
var observations = require('../controllers/observations')
const model = require('../models/observations');
var multer = require('multer');



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        // Make the file name the date + the file extension
        filename =  Date.now() + '.' + file_extension[file_extension.length-1];
        cb(null, filename);
    }
});
let upload = multer({ storage: storage });



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
  res.render('observationForm', { title: 'Express' });
});

router.post('/', function(req, res) {
  console.log(req.body);
  res.render('observationForm', { title: 'Express' });
});


router.post('/add', upload.single('image'), async function (req, res, next) {
    try {
        let userData = req.body;
        let filePath = req.file.path;
        let result = await observations.create(userData, filePath);
        console.log(result);
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send("Error saving observation");
    }
});





module.exports = router;
