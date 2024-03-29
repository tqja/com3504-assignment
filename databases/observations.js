const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1:27017/floraExplorerDB';
let connection;

mongoose.Promise = global.Promise;

mongoose.connect(mongoDB).then(result => {
    connection = result.connection;
    console.log("Connection successful!");
}).catch(err => {
    console.log("Connection failed!", err);
});