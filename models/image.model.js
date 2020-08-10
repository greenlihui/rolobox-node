const mongoose = require('mongoose');
const Face = require('../models/face.model');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;
const aws = require('../services/aws.service');
const IMAGES_FOLDER = require('../app-config').IMAGES_FOLDER;
const COMPRESSED_FOLDER = require('../app-config').COMPRESSED_FOLDER;

const imageSchema = mongoose.Schema({
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    filename: { // the image file name of local file and S3
        type: String,
        required: true
    },
    faces: [{
        type: ObjectId,
        ref: 'Face'
    }],
    faceDetails: Mixed,
    uploadedOn: {
        type: Date,
        default: Date.now
    }
}, {toJSON: {versionKey: false}});


// Delete an image will trigger delete all faces in that image and s3 object
imageSchema.pre('remove', {document: true}, async function (next) {
    Face.find({_id: {$in: this.faces}}).then(faces => {
        Promise.all(faces.map(face => face.remove())).then(_ => next());
    });
    await aws.s3.deleteObject(IMAGES_FOLDER, this.filename);
    await aws.s3.deleteObject(COMPRESSED_FOLDER, this.filename);
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
