const express = require("express");
const router = express.Router();

const controller = require("../controllers/observations");
const model = require("../models/observations");
const multer = require("multer");
const { createWriteStream } = require("fs");
const { basename, join } = require("path");
const { pipeline } = require("stream/promises");
const { parse } = require("url");
const { dbpediaController } = require("../controllers/dbpedia");
const fs = require("fs");
const path = require("path");

// TODO: may need to change how filenames are generated
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads/");
  },
  filename: function (req, file, cb) {
    const original = file.originalname;
    const file_extension = original.split(".");
    // Make the file name the date + the file extension
    const filename =
      Date.now() + "." + file_extension[file_extension.length - 1];
    cb(null, filename);
  },
});
let upload = multer({ storage: storage });

router.get("/", (req, res) => {
  let result = controller.getAll();
  result
    .then((observations) => {
      const data = JSON.parse(observations);
      res.render("index", { title: "Home", data: data });
    })
    .catch(() => {
      const data = {};
      res.render("index", { title: "Home", data: data });
    });
});

router.get("/allObservations", function (req, res, next) {
  controller
    .getAll()
    .then((observations) => {
      return res.status(200).send(observations);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

router.get("/create", (req, res) => {
  res.render("newObservation", { title: "New post" });
});

// TODO: Add proper error handling to routes
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    let userData = req.body;
    let filePath;
    // Check if uploading from file or URL
    if (req.file) {
      filePath = req.file.path;
    } else if (userData.imageUrl) {
      filePath = await saveFromURL(userData.imageUrl);
    }

    let observation = await controller.create(userData, filePath);

    return res.status(200).json(observation);
  } catch (error) {
    console.error("Error saving observation:", error);
    return res.status(500).send("Error saving observation");
  }
});

router.get("/observations", (req, res) => {
  res.render("observationDetails", { title: "Observation details" });
});

router.post("/dir", (req, res) => {
  const directoryPath = req.body.directoryPath;
  const files = fs.readdirSync(directoryPath);
  let fileList = [];

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    // Remove the 'public/' prefix from the file path
    const modifiedFilePath = filePath.replace(/^public\//, "");
    fileList.push(modifiedFilePath);
  });

  return res.json({ fileList: fileList });
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
    if (data.chatHistory) {
      updateData.chatHistory = data.chatHistory;
    }

    let observation = await controller.edit(data.id, updateData);
    console.log(observation);
    return res.status(200).send(observation);
  } catch {
    return res.status(500).send("Error saving observation");
  }
});

router.get("/map", (req, res) => {
  res.render("map", { title: "Map" });
});

router.post("/add-chat", async (req, res) => {
  const chatDetails = req.body;
  const updatedObservation =
    await controller.observation_update_chat_history(chatDetails);
  if (updatedObservation) {
    return res.status(200).send(updatedObservation);
  } else {
    return res.status(500).send("Error adding chat");
  }
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

/** Makes a SPARQL query to DBPedia. Retrieves data if successful, or an empty array otherwise. */
router.get("/sparqlQuery", (req, res) => {
  dbpediaController(req, res)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch data" });
    });
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
    throw err;
  }
}
router.get("/sort-by-distance", async (req, res) => {
  const { latitude, longitude, order = "closest" } = req.query; // Default to closest if not specified
  console.log("Received coordinates:", latitude, longitude);

  try {
    const observations = await model.find();
    console.log("Fetched observations:", observations.length);

    const sortedObservations = observations
      .map((observation) => {
        const latDiff = observation.location.latitude - parseFloat(latitude);
        const lonDiff = observation.location.longitude - parseFloat(longitude);
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
        return { ...observation.toObject(), distance };
      })
      .sort((a, b) => {
        return order === "closest"
          ? a.distance - b.distance
          : b.distance - a.distance;
      });

    console.log("Sorted observations:", sortedObservations.length);
    res.json(sortedObservations);
  } catch (error) {
    console.error("Error sorting observations by distance: ", error);
    res.status(500).send("Error sorting observations by distance");
  }
});

// handle 404 (ensure this route is last!)
router.get("*", function (req, res) {
  res.redirect("/");
});

module.exports = router;
