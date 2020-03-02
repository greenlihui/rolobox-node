const sharp = require('sharp');
const uuid = require('uuid/v1');
const imageMin = require('imagemin');
const imageMinMozJpeg = require('imagemin-mozjpeg');
const imageMinPngquant = require('imagemin-pngquant');
const fs = require('fs');

const config = require('../app-config');
const IMAGES_FOLDER = config.IMAGES_FOLDER;
const FACES_THUMBNAIL_FOLDER = config.FACES_THUMBNAIL_FOLDER;
const LOCAL_IMAGES_FOLDER = config.LOCAL_IMAGES_FOLDER;
const LOCAL_FACES_FOLDER = config.LOCAL_FACES_FOLDER;
const LOCAL_COMPRESSED_FOLDER = config.LOCAL_COMPRESSED_FOLDER;



async function compressImageInSize(filename) {
    const imageFilepath = LOCAL_IMAGES_FOLDER + filename;
    return sharp(imageFilepath)
        .resize(300, 300)
        .toFile(LOCAL_COMPRESSED_FOLDER + filename);
}

async function compressImageInQuality(filename) {
    const imageFilepath = LOCAL_IMAGES_FOLDER + filename;
    return imageMin([imageFilepath], {
        destination: LOCAL_COMPRESSED_FOLDER,
        plugins: [
            imageMinMozJpeg({
                quality: 20
            }),
            imageMinPngquant({
                quality: [0.4, 0.6]
            })
        ]
    });
}

/**
 * According to the FaceDetails that is returned from detect faces,
 * generate face thumbnails and upload to faces folder in S3 Bucket.
 * @param {String} filename The filename of the image to be cropped to generate faces
 * @param {Array} faceDetails Data returned from AWS detectFaces
 * @return {Promise<[any, any, any...]>} Promises of all thumbnails uploaded to the bucket.
 */
async function generateThumbnail(filename, faceDetails) {
    const imageFilePath = LOCAL_IMAGES_FOLDER + filename;
    const image = sharp(imageFilePath);
    let cropPromises = [];
    for (let i = 0; i < faceDetails.length; i++) {
        const outputFilename = uuid();
        const metadata = await image.metadata();
        const boundingBox = faceDetails[i].BoundingBox;
        const squareBoundingBox = generateSquareBoundingBox(boundingBox, metadata);
        const fileAbsolutePath = LOCAL_FACES_FOLDER + outputFilename;
        cropPromises.push(image.extract(squareBoundingBox).toFile(fileAbsolutePath));
        faceDetails[i].ThumbnailImageFilename = outputFilename;
    }
    return Promise.all(cropPromises);
}

/**
 * @param boundingBox BoundingBox contained in FaceDetail returned from AWS
 * @param meta The metadata of the image to be cropped
 * @returns {{top: number, left: number, width: number, height: number}}
 */
function generateSquareBoundingBox(boundingBox, meta) {
    const imageWidth = meta.width;
    const imageHeight = meta.height;

    let left = boundingBox.Left * imageWidth;
    let top = boundingBox.Top * imageHeight;
    let width = boundingBox.Width * imageWidth;
    let height = boundingBox.Height * imageHeight;

    if (height > width) {
        const offset = (height - width) / 2.0;
        const tmpLeft = left - offset;
        if (tmpLeft >= 0) {
            left = tmpLeft;
            width = height;
        } else {
            top = top + offset;
            height = width;
        }
    }
    if (height < width) {
        const offset = (width - height) / 2.0;
        const tmpTop = top - offset;
        if (tmpTop >= 0) {
            top = tmpTop;
            height = width;
        } else {
            left = left + offset;
            width = height;
        }
    }
    return {
        left: Math.round(left), top: Math.round(top),
        width: Math.round(width), height: Math.round(height)
    };
}


/**
 * Generate a face document from aws index face result
 * @param faceRecord One FaceRecord from AWS indexFace result
 * @returns {Object} Generated Face document
 */
function generateFaceDoc(userId, faceRecord) {
    return {
        awsFaceId: faceRecord.Face.FaceId,
        awsImageId: faceRecord.Face.ImageId,
        awsCollectionId: userId,
        thumbnailImageFilename: faceRecord.Face.ExternalImageId,
        details: faceRecord.FaceDetail
    };
}


/**
 * Notes:
 * For AgeRange filtering: filter those contact whose age range overlap with the age range filter.
 */
function processFilters(filters) {
    const res = [];
    filters.forEach(i => {
        let key = Object.keys(i)[0];
        const value = Object.values(i)[0];
        switch (key) {
            case 'AgeRange':
                res.push({
                    $nor: [
                        {'details.AgeRange.Low': {$gt: parseInt(value.High)}},
                        {'details.AgeRange.High': {$lt: parseInt(value.Low)}}
                    ]
                });
                break;
            case 'Gender':
                res.push({'details.Gender.Value': value});
                break;
            default:
                const obj = {};
                obj['details.' + key + '.Value'] = value;
                res.push(obj);
        }
    });
    return res;
}

function deleteFile(filepath, cb) {
    fs.unlink(filepath, cb);
}

module.exports = {
    generateFaceDoc: generateFaceDoc,
    generateThumbnail: generateThumbnail,
    processFilters: processFilters,
    compressImageInSize: compressImageInSize,
    compressImageInQuality: compressImageInQuality,
    deleteFile: deleteFile
};
