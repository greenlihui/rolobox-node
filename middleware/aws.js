const AWS = require('aws-sdk');

// AWS Configuration
AWS.config.loadFromPath('./aws-config.json');

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

module.exports = {
    rekognition: rekognition,
    s3: s3
};
