const Image = require('../models/image.model');
const ObjectId = require('mongoose').Types.ObjectId;

function save(image) {
    return (new Image(image)).save();
}

function findById(imageId) {
    return Image.findById(imageId).exec();
}

function findByFaceId(faceId) {
    return Image.findOne()
        .where('faces').equals(faceId)
        .select('-faceDetails')
        .exec();
}

function findByFilename(filename) {
    return Image.findOne()
        .where('filename').equals(filename)
        .exec();
}

async function deleteByFilename(filename) {
    return (await Image.findOne()
        .where('filename').equals(filename))
        .remove();
}

function attachFace(srcImage, faceId) {
    srcImage.faces.push(faceId);
    return srcImage.save();
}

function findByOwner(userId) {
    return Image.aggregate([
        { // 1. find all documents whose owner matches userId
            $match: {
                owner: new ObjectId(userId)
            }
        }, { // 2. project document to following format
            $project: {
                filename: '$filename',
                uploadedOn: {
                    month: {
                        $month: '$uploadedOn'
                    },
                    year: {
                        $year: '$uploadedOn'
                    }
                }
            }
        }, { // 3. sort by year and month in descending order
            $sort: {
                'uploadedOn.year': -1,
                'uploadedOn.month': -1
            }
        }, { // 4. group image ids uploaded in the same month of same year
            $group: {
                _id: '$uploadedOn',
                monthIds: {
                    $addToSet: '$filename'
                }
            }
        }, { // 5. group by year
            $group: {
                _id: "$_id.year",
                content: {
                    $addToSet: {
                        month: '$_id.month',
                        imageFilenames: '$monthIds'
                    }
                }
            }
        }, { // 6. project to {year: ***, content: [{month: ***, imageIds: [***, ***, ...]},...]
            $project: {
                year: '$_id',
                _id: 0,
                content: true
            }
        }
    ]).exec();
}

module.exports = {
    save: save,
    findByOwner: findByOwner,
    findByFilename: findByFilename,
    attachFace: attachFace,
    deleteByFilename: deleteByFilename,
    findById: findById,
    findByFaceId: findByFaceId
};
