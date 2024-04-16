const observationModel = require('../models/observations');

exports.create = function (userData) {
    let observation = new observationModel({
        nickname: userData.nickname,
        name: userData.name,
        image: userData.image,
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
        flowering: userData.flowering,
        fragrant: userData.fragrant,
        fruiting: userData.fruiting,
        native: userData.native
    });
    return observation.save().then(observation => {
        return JSON.stringify(observation);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

exports.getAll = () => {
    return observationModel.find().then(observations => {
        return JSON.stringify(observations)
    }).catch(err => {
        console.log(err);
        return null;
    });
};

exports.get = (id) => {
    return observationModel.findById(id).then(observation => {
        return JSON.stringify(observation)
    }).catch(err => {
       console.log(err);
       return null;
    });
}

exports.update = (id) => {

}