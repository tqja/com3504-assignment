const observationModel = require("../models/observations");
const https = require("https");

const create = function (userData, filePath) {
  const flowering = !!userData.flowering;
  const leafy = !!userData.leafy;
  const fragrant = !!userData.fragrant;
  const fruiting = !!userData.fruiting;
  const native = !!userData.native;

  let observation = new observationModel({
    nickname: userData.nickname,
    name: userData.name,
    image: filePath.replace(/^public\//, ''),
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
    chat_history: []
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

const edit = (observationId, updateData) => {
  return observationModel.findByIdAndUpdate(observationId, updateData, {new: true})
      .then((observation) => {
        return JSON.stringify(observation);
      }).catch((err) => {
        console.error(err);
        return null;
      });
};

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
  const observationId = chatDetails.observation_id
  const chat_username = chatDetails.chat_username
  const chat_text = chatDetails.chat_text
  const message = { chat_username: chat_username, chat_text: chat_text }

  try {
    await observationModel.findByIdAndUpdate( observationId,
        { $push: {
            chat_history: message
          }
        }).exec()
  } catch (err) {
    console.log(err)
  }
}

module.exports = { create, edit, observation_update_chat_history, getAll};
