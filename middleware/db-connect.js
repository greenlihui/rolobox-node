const mongoose = require('mongoose');

const DB_URL = require('../app-config').DB_URI;
const options = {
    useNewUrlParser: true,
    autoReconnect: true,
    bufferCommands: false,
    useFindAndModify: false,
    useCreateIndex: true
};

module.exports = function () {
    mongoose.connect(DB_URL, options);

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('Mongoose: Successfully connected to database');
    });

// If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            console.log('Mongoose: Default connection disconnected through app termination');
            process.exit(0);
        });
    });
};
