const Face = require('../models/face.model');

function save(face) {
    return (new Face(face)).save();
}

function findByImageId(imageId) {
    return Face.find()
        .where('srcImage').equals(imageId)
        .exec();
}

function findByAWSFaceIds(faceIds) {
    return Face.find()
        .where('awsFaceId').in(faceIds)
        .select('_id')
        .exec();
}

function getAll() {
    return Face.find().populate('owner').exec();
}

function getByImageId(imageId) {
    const reg = new RegExp(imageId + '*', 'i');
    return Face.find({faceId: {$regex: reg}}).exec();
}

async function deleteFace(faceId) {
    const face = await Face.findById(faceId).exec();
    return face.remove();
}

module.exports = {
    save: save,
    findByImageId: findByImageId,
    getAll: getAll,
    // getByImageId: getByImageId,
    findByAWSFaceIds: findByAWSFaceIds,
    deleteFace: deleteFace
};


