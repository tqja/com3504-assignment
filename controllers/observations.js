const observationModel = require("../models/observations");

exports.create = function (userData, filePath) {
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
      console.log(err);

      // Return null in case of an error
      return null;
    });
};

exports.getAll = () => {
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
