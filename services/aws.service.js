const aws = require('../middleware/aws');
const rekognition = aws.rekognition;
const s3 = aws.s3;

const fs = require('fs');

const config = require('../app-config');
const S3_BUCKET_NAME = config.S3_BUCKET_NAME;
const S3_BACKUP_PATH = config.S3_BACKUP_PATH;
const IMAGES_FOLDER = config.IMAGES_FOLDER;
const LOCAL_IMAGES_FOLDER = config.LOCAL_IMAGES_FOLDER;
const LOCAL_FACES_FOLDER = config.LOCAL_FACES_FOLDER;
const FACES_THUMBNAIL_FOLDER = config.FACES_THUMBNAIL_FOLDER;
const FACE_MATCH_THRESHOLD = config.FACE_MATCH_THRESHOLD;


/******************** REKOGNITION APIS ********************/
function createCollection(collectionId) {
    const params = {
        CollectionId: collectionId
    };
    return rekognition.createCollection(params).promise();
}

function deleteFace(collectionId, awsFaceId) {
    const params = {
        CollectionId: collectionId,
        FaceIds: [awsFaceId]
    };
    return rekognition.deleteFaces(params).promise();
}

function detectFaces(imageId) {
    const params = {
        Image: {
            Bytes: fs.readFileSync(LOCAL_IMAGES_FOLDER + imageId)
        },
        Attributes: ['ALL']
    };
    return rekognition.detectFaces(params).promise();
}

function indexFace(thumbnailImageId, collectionId) {
    const params = {
        CollectionId: collectionId,
        DetectionAttributes: ['ALL'],
        ExternalImageId: thumbnailImageId,
        MaxFaces: 1,
        Image: {
            S3Object: {
                Bucket: S3_BUCKET_NAME,
                Name: FACES_THUMBNAIL_FOLDER + thumbnailImageId
            }
        }
    };
    return rekognition.indexFaces(params).promise();
}

function searchSimilarFaces(collectionId, thumbnailImageFilename) {
    const params = {
        CollectionId: collectionId,
        FaceMatchThreshold: FACE_MATCH_THRESHOLD,
        Image: {
            Bytes: fs.readFileSync(LOCAL_FACES_FOLDER + thumbnailImageFilename)
        },
        MaxFaces: 10
    };
    return rekognition.searchFacesByImage(params).promise();
}

/******************** S3 APIS ********************/

/**
 * Upload an object to S3 bucket.
 * @param folder The folder that the object to be uploaded to.
 * Either IMAGES_FOLDER or FACES_THUMBNAIL_FOLDER
 * @param filename The filename that the object will be named in the bucket
 * @returns {Promise<PromiseResult<S3.PutObjectOutput, AWSError>>}
 */
function putObject(folder, filename) {
    const filepath = S3_BACKUP_PATH + folder + filename;
    const params = {
        Body: fs.readFileSync(filepath),
        Bucket: S3_BUCKET_NAME,
        Key: folder + filename
    };
    return s3.putObject(params).promise();
}

function getObject(folder, filename) {
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: folder + filename
    };
    return s3.getObject(params).promise();
}

function deleteObject(folder, filename) {
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: folder + filename
    };
    return s3.deleteObject(params).promise();
}

module.exports = {
    rekognition: {
        createCollection: createCollection,
        detectFaces: detectFaces,
        indexFace: indexFace,
        searchSimilarFaces: searchSimilarFaces,
        deleteFace: deleteFace
    },
    s3: {
        putObject: putObject,
        getObject: getObject,
        deleteObject: deleteObject
    }
};
