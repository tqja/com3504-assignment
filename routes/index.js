var express = require("express");
var router = express.Router();

var controller = require("../controllers/observations");
const model = require("../models/observations");
var multer = require("multer");
const { generateUsername } = require("../utils/generateUsername");
const { createWriteStream } = require("fs");
const { basename, join } = require("path");
const { pipeline } = require("stream/promises");
const { parse } = require("url");

// TODO: may need to change how filenames are generated
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads/");
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    var filename = Date.now() + "." + file_extension[file_extension.length - 1];
    cb(null, filename);
  },
});
let upload = multer({ storage: storage });

/* GET home page. */
router.get("/", (req, res) => {
  let result = controller.getAll();
  result.then((observations) => {
    let data = JSON.parse(observations);
    res.render("index", { title: "Express", data: data });
  });
});

router.post("/", (req, res) => {
  console.log(req.body);
  res.render("newObservation", { title: "Express" });
});

router.get("/create", (req, res) => {
  res.render("newObservation", { title: "Create new plant" });
});

// TODO: Add proper error handling to routes
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    let userData = req.body;
    let filePath;

    // check if uploading from file or URL
    if (req.file) {
      filePath = req.file.path;
    } else if (userData.imageUrl) {
      filePath = await saveFromURL(userData.imageUrl);
    }

    // save observation if filePath exists
    if (filePath) {
      await controller.create(userData, filePath);
    }

    res.redirect("/");
  } catch (error) {
    console.error("Error saving observation: ", error);
    res.status(500).send("Error saving observation");
  }
});

router.post("/edit", async (req, res) => {
  try {
    const data = req.body;
    const updateData = {};

    // set up object with plant name or status
    if (data.plantName) {
      updateData.name = data.plantName;
    }
    if (data.status) {
      updateData.status = data.status;
    }

    await controller.edit(data.observationId, updateData);
  } catch {
    res.status(500).send("Error saving observation");
  }
});

router.get("/map", (req, res) => {
  res.render("map", { title: "Map" });
});

router.get("/sort", async (req, res) => {
  try {
    const sortField = req.query.field || "dateSeen";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const observations = await model.find().sort({ [sortField]: sortOrder });
    res.json(observations);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

router.post("/new-user", async (req, res) => {
  const newUsername = generateUsername();
  res.json({ username: newUsername });
});

router.get("/observations/:id", async (req, res) => {
  try {
    const observation = await model.findById(req.params.id);
    if (!observation) {
      return res.status(404).send("Observation not found");
    }
    // Render a template for displaying the observation details
    res.render("observationdetails", { observation: observation });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
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
    const uploadPath = join("public", "images", "uploads", filename);

    // write image to destination file
    const writeStream = createWriteStream(uploadPath);
    await pipeline(res.body, writeStream);
    return uploadPath;
  } catch (err) {
    console.error("Error saving from URL: ", err);
    return null;
  }
}

module.exports = router;
