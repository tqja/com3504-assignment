const observationModel = require("../models/observations");

/**
 * Create an observation
 * @param userData
 * @param filePath
 * @returns {*}
 */
const create = function (userData, filePath) {
  const flowering = !!userData.flowering;
  const leafy = !!userData.leafy;
  const fragrant = !!userData.fragrant;
  const fruiting = !!userData.fruiting;
  const native = !!userData.native;

  let observation = new observationModel({
    nickname: userData.nickname,
    name: userData.name,
    image: filePath.replace(/^public\//, ""),
    dateSeen: userData.dateSeen,
    description: userData.description,
    location: {
      latitude: userData.latitude,
      longitude: userData.longitude,
    },
    height: userData.height,
    spread: userData.spread,
    sunlight: userData.sunlight,
    soilType: userData.soilType,
    colour: userData.colour,
    flowering: flowering,
    leafy: leafy,
    fragrant: fragrant,
    fruiting: fruiting,
    native: native,
    chat_history: [],
  });
  return observation
    .save()
    .then((savedObservation) => {
      return JSON.stringify(savedObservation);
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

const createSync = function (userData, filePath) {
  let observation = new observationModel({
    nickname: userData.nickname,
    name: userData.name,
    image: filePath.replace(/^public\//, ""),
    dateSeen: userData.dateSeen,
    description: userData.description,
    location: {
      latitude: userData.location.latitude,
      longitude: userData.location.longitude,
    },
    height: userData.height,
    spread: userData.spread,
    sunlight: userData.sunlight,
    soilType: userData.soilType,
    colour: userData.colour,
    flowering: userData.flowering,
    leafy: userData.leafy,
    fragrant: userData.fragrant,
    fruiting: userData.fruiting,
    native: userData.native,
    chat_history: userData.chat_history, // Ensure this matches the field name in userData
  });

  return observation
    .save()
    .then((savedObservation) => {
      return JSON.stringify(savedObservation);
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

/**
 * Edit an observation
 * @param observationId
 * @param updateData
 * @returns {Promise<string>}
 */
const edit = (observationId, updateData) => {
  return observationModel
    .findByIdAndUpdate(observationId, updateData, { new: true })
    .then((observation) => {
      return JSON.stringify(observation);
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

/**
 * Get all observations
 * @returns {Promise<string>}
 */
const getAll = () => {
  return observationModel
    .find()
    .then((observations) => {
      return JSON.stringify(observations);
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
};

observation_update_chat_history = async (chatDetails) => {
  const observationID = chatDetails.observationID;
  const username = chatDetails.chat_username;
  const text = chatDetails.chat_text;
  const time = chatDetails.time;
  const message = { chat_username: username, chat_text: text, time: time };

  return observationModel
    .findByIdAndUpdate(
      observationID,
      { $push: { chat_history: message } },
      { new: true },
    )
    .then((observation) => {
      return JSON.stringify(observation);
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

module.exports = {
  create,
  createSync,
  edit,
  observation_update_chat_history,
  getAll,
};
