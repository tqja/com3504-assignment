var express = require('express');
var router = express.Router();

var controller = require('../controllers/observations')
const model = require('../models/observations');
var multer = require('multer');

// TODO: may need to change how filenames are generated
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
  res.render('newObservation', { title: 'Express' });
});

router.post('/', function(req, res) {
  console.log(req.body);
  res.render('newObservation', { title: 'Express'});
});

// TODO: Add proper error handling to routes
router.post('/add', upload.single('image'), async function (req, res, next) {
    try {
        let userData = req.body;
        let filePath = req.file.path;
        let result = await controller.create(userData, filePath);
        console.log(result);
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send("Error saving observation");
    }
});

module.exports = router;
