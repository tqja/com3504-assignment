const express = require("express");
const router = express.Router();

const controller = require("../controllers/observations");
const multer = require("multer");
const { createWriteStream } = require("fs");
const { basename, join } = require("path");
const { pipeline } = require("stream/promises");
const { parse } = require("url");
const { dbpediaController } = require("../controllers/dbpedia");
const fs = require("fs");
const path = require("path");

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

router.get("/allObservations", function (req, res) {
  controller
    .getAll()
    .then((observations) => {
      return res.status(200).send(observations);
    })
    .catch((err) => {
      console.error(err);
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

router.post("/addSync", upload.single("image"), async (req, res) => {
  try {
    let userData = JSON.parse(req.body.data); // Ensure this is parsed correctly
    let filePath = req.file.path;
    let observation = await controller.createSync(userData, filePath);
    if (observation) {
      console.error(observation);
      return res.status(200).json(observation);
    } else {
      console.error("Observation could not be saved.");
    }
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

    return res.status(200).send(observation);
  } catch {
    return res.status(500).send("Error saving observation");
  }
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

// handle 404 (ensure this route is last!)
router.get("*", function (req, res) {
  res.redirect("/");
});

module.exports = router;
