var express = require("express");
var router = express.Router();

var controller = require("../controllers/observations");
const model = require("../models/observations");
var multer = require("multer");
const { generateUsername } = require("../utils/generateUsername");

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
    let result = controller.getAll();
    result.then(observations => {
       let data = JSON.parse(observations);
        res.render('index', { title: 'Express', data: data });
    });
});

router.post('/', function(req, res) {
  console.log(req.body);
  res.render('newObservation', { title: 'Express'});
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

router.post("/verify-username", async (req, res) => {
  const { username } = req.body;
  // TODO: verify validity of username on serverside
  const valid = true;
  res.json({ valid: valid });
});

router.post("/new-user", async (req, res) => {
  const newUsername = await generateUsername();
  // TODO: check for conflict with existing name in server db/save in server db
  res.json({ username: newUsername });
});

router.get('/observations/:id', async (req, res) => {
    try {
        const observation = await model.findById(req.params.id);
        if (!observation) {
            return res.status(404).send('Observation not found');
        }
        // Render a template for displaying the observation details
        res.render('observationdetails', { observation: observation });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
