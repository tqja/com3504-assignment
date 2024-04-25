var express = require('express');
var router = express.Router();
const { createWriteStream } = require("fs");
const { basename, join } = require("path");
const { pipeline } = require("stream/promises");
var controller = require('../controllers/observations')
const model = require('../models/observations');
var multer = require('multer');
const fs = require("fs");
const path = require("path");

// TODO: may need to change how filenames are generated
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
        const original = file.originalname;
        const file_extension = original.split(".");
        // Make the file name the date + the file extension
        const filename = Date.now() + '.' + file_extension[file_extension.length-1];

        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/create', (req, res) => {
  res.render('newObservation', { title: 'Create new plant' });
})

router.post('/dir', (req, res) => {
    const directoryPath = req.body.directoryPath;
    const files = fs.readdirSync(directoryPath);
    let fileList = [];

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
        // Remove the 'public/' prefix from the file path
        const modifiedFilePath = filePath.replace(/^public\//, ''); // Using a regex to remove 'public/' from the beginning of the path
        fileList.push(modifiedFilePath);
    });

    return res.json({fileList: fileList});
});

/**
 * Fetch the image from the URL and save it to the uploads filepath.
 * @param imageUrl The URL to fetch and save
 * @returns {Promise<string|*|null>} The upload path if successful, or null on failure
 */
async function saveFromURL(imageUrl) {
    try {
        // fetch the image and get filename + destination
        const res = await fetch(imageUrl);
        const filename = basename(parse(imageUrl).pathname);
        const uploadPath = join("public", "images", filename);

        // write image to destination file
        const writeStream = createWriteStream(uploadPath);
        await pipeline(res.body, writeStream);
        return uploadPath;
    } catch (err) {
        throw err;
    }
}

router.post("/add", upload.single("image"), async (req, res) => {
    // let userData = req.body;
    // let filePath;
    //
    // // Check if uploading from file or URL
    // if (req.file) {
    //     filePath = req.file.path;
    //     console.log("File uploaded. File path:", filePath);
    // } else if (userData.imageUrl) {
    //     try {
    //         filePath = await saveFromURL(userData.imageUrl);
    //         console.log("URL uploaded. File path:", filePath);
    //     } catch (error) {
    //         console.error("Error saving observation:", error);
    //         res.status(500).send(`Error saving observation. Error: ${error}`);
    //     }
    // }
    //
    // // Save observation if filePath exists
    // if (filePath) {
    //     controller.create(userData, filePath).then(observation => {
    //         console.log("Observation saved.");
    //         return res.status(200).send(observation);
    //     }).catch(error => {
    //         console.error("Error saving observation:", error);
    //         res.status(500).send(`Error saving observation. Error: ${error}`);
    //     });
    // }

    try {
        let userData = req.body;
        let filePath;

        // Check if uploading from file or URL
        if (req.file) {
            filePath = req.file.path;
            console.log("File uploaded. File path:", filePath);
        } else if (userData.imageUrl) {
            filePath = await saveFromURL(userData.imageUrl);
            console.log("URL uploaded. File path:", filePath);
        }

        // // Save observation if filePath exists
        // if (filePath) {
        //     await controller.create(userData, filePath);
        //     console.log("Observation saved.");
        // }

        let observation = await controller.create(userData, filePath);
        console.log("Observation saved.");
        return res.status(200).send(observation);
    } catch (error) {
        console.error("Error saving observation:", error);
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
