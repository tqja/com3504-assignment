const express = require("express");
const router = express.Router();

const controller = require("../controllers/observations");
const model = require("../models/observations");
const multer = require("multer");
const { generateUsername } = require("../utils/generateUsername");
const { createWriteStream } = require("fs");
const { basename, join } = require("path");
const { pipeline } = require("stream/promises");
const { parse } = require("url");
const { dbpediaController } = require("../controllers/dbpedia");

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

/* GET home page. */
router.get("/", (req, res) => {
  let result = controller.getAll();
  result.then((observations) => {
    let data = JSON.parse(observations);
    res.render("index", { title: "Home", data: data });
  });
});

router.post("/", (req, res) => {
  console.log(req.body);
  res.render("newObservation", { title: "Home" });
});

router.get("/create", (req, res) => {
  res.render("newObservation", { title: "New post" });
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
    res.status(200).send("Observation updated successfully");
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
    res.render("observationDetails", {
      title: `${observation.name} details`,
      observation: observation,
      observationId: req.params.id
    });
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
router.get("/filter", async (req, res) => {
  try {
    const {status, color, flowering, soil, sunlight, leafy, fragrant, fruiting, native } = req.query;
    let query = {};
    if (status && status !== 'no-preference') {
      if (status === 'no') {
        query.status = 'In_progress';
      } else if (status === 'yes') {
        query.status = 'Completed';
      }
    }
    if (color && color !== 'Any') {
      query.colour = color;
    }
    if (flowering && flowering !== 'no-preference') {
      query.flowering = flowering === 'yes' ? true : false;
    }
    if (soil && soil !== 'no-preference') {
      query.soilType = soil;
    }
    if (sunlight && sunlight !== 'no-preference') {
      query.sunlight = sunlight;
    }
    if (leafy && leafy !== 'no-preference') {
      query.leafy = leafy === 'yes' ? true : false;
    }
    if (fragrant && fragrant !== 'no-preference') {
      query.fragrant = fragrant === 'yes' ? true : false;
    }
    if (fruiting && fruiting !== 'no-preference') {
      query.fruiting = fruiting === 'yes' ? true : false;
    }
    if (native && native !== 'no-preference') {
      query.native = native === 'yes' ? true : false;
    }

    const observations = await model.find(query);
    res.json(observations);
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
router.get("/sort-by-distance", async (req, res) => {
  const { latitude, longitude, order = "closest" } = req.query; // Default to closest if not specified
  console.log("Received coordinates:", latitude, longitude);

  try {
    const observations = await model.find();
    console.log("Fetched observations:", observations.length);

    const sortedObservations = observations.map(observation => {
      const latDiff = observation.location.latitude - parseFloat(latitude);
      const lonDiff = observation.location.longitude - parseFloat(longitude);
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
      return { ...observation.toObject(), distance };
    }).sort((a, b) => {
      return order === "closest" ? a.distance - b.distance : b.distance - a.distance;
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
