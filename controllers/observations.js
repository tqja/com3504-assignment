const observationModel = require("../models/observations");

const create = function (userData, filePath) {
  const flowering = !!userData.flowering;
  const leafy = !!userData.leafy;
  const fragrant = !!userData.fragrant;
  const fruiting = !!userData.fruiting;
  const native = !!userData.native;

  let observation = new observationModel({
    nickname: userData.nickname,
    name: userData.name,
    image: filePath,
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
  });
  return observation
    .save()
    .then((observation) => {
      console.log(observation);

      return JSON.stringify(observation);
    })
    .catch((err) => {
      // Log the error if saving fails
      console.error(err);

      // Return null in case of an error
      return null;
    });
};

const edit = async (observationId, updateData) => {
  try {
    return await observationModel.findByIdAndUpdate(observationId, updateData);
  } catch (err) {
    return err.message;
  }
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

module.exports = { create, edit, getAll };
