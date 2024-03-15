const observationModel = require('../models/observations');

exports.create = function (userData, filePath) {
    const flowering = !!userData.flowering;
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
            longitude: userData.longitude
        },
        height: userData.height,
        spread: userData.spread,
        sunlight: userData.sunlight,
        soil_type: userData.soil_type,
        flowering: flowering,
        fragrant: fragrant,
        fruiting: fruiting,
        native: native
    });
    return observation.save().then(observation => {
        console.log(observation);

        return JSON.stringify(observation);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};