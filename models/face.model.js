const mongoose = require('mongoose');
const Image = require('../models/image.model');
const Contact = require('../models/contact.model');
const Mixed = mongoose.Schema.Types.Mixed;
const aws = require('../services/aws.service');
const FACES_THUMBNAIL_FOLDER = require('../app-config').FACES_THUMBNAIL_FOLDER;
const USER_DEFAULT_AVATAR_FILENAME = require('../app-config').USER_DEFAULT_AVATAR_FILENAME;

const faceSchema = mongoose.Schema({
    thumbnailImageFilename: {
        type: String,
        required: true
    },
    awsImageId: String,
    awsFaceId: String,
    awsCollectionId: String,
    details: Mixed
}, {toJSON: {versionKey: false}});

// Delete face will trigger deleting face thumbnail stored in s3 and indexed faced id
// and delete referencing in image docs and contact docs
faceSchema.pre('remove', {document: true}, async function (next) {
    await aws.s3.deleteObject(FACES_THUMBNAIL_FOLDER, this.thumbnailImageFilename);
    await aws.rekognition.deleteFace(this.awsCollectionId, this.awsFaceId);

    // delete one face reference from image faces list
    await Image.updateOne({faces: this._id}, {$pull: {faces: this._id}});

    // delete one face reference from contact faces list
    await Contact.updateOne({'faces.list': this._id}, {$pull: {'faces.list': this._id}});

    // get the contact that has removed a face, set his
    const contact = Contact
        .findOne({'faces.avatar': this.thumbnailImageFilename})
        .populate('faces.list', 'thumbnailImageFilename')
        .exec();
    if (contact) {
        if (contact.faces.list.length) {
            await contact.updateOne({'faces.avatar': contact.faces.list[0].thumbnailImageFilename}).exec()
        } else {
            await contact.updateOne({'faces.avatar': USER_DEFAULT_AVATAR_FILENAME}).exec();
        }
    }
    next();
});

const Face = mongoose.model('Face', faceSchema);

module.exports = Face;
