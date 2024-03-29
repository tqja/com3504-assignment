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
        var filename =  Date.now() + '.' + file_extension[file_extension.length-1];
        cb(null, filename);
    }
});
let upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res) {
    // let result = controller.getAll();
    // result.then(observations => {
    //    let data = JSON.parse(observations);
    //     res.render('index', { title: 'Express', data: data });
    // });
    res.render('index', { title: 'Express' });
});

router.get('/create', (req, res) => {
  res.render('newObservation', { title: 'Create new plant' });
})

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

router.get('/map', (req, res) => {
  res.render('map', { title: 'Map' });
});

router.get('/allObservations', function (req, res, next) {
    controller.getAll().then(observations => {
        console.log(observations);
        return res.status(200).send(observations);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

router.get('/observation', function (req, res, next) {
    model.findById(req.query.id).then(observation => {
        console.log(observation);
        return res.status(200).send(observation);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

router.get('/observations', (req, res) => {
    res.render('observationdetails');
});

module.exports = router;
