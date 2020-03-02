const router = require('express').Router();
const uploader = require('../middleware/uploader');
const utils = require('../middleware/utils');
const awsService = require('../services/aws.service');
const imageService = require('../services/image.service');

const config = require('../app-config');
const IMAGES_FOLDER = config.IMAGES_FOLDER;
const COMPRESSED_FOLDER = config.COMPRESSED_FOLDER;
const FACES_THUMBNAIL_FOLDER = config.FACES_THUMBNAIL_FOLDER;
const LOCAL_IMAGES_FOLDER = config.LOCAL_IMAGES_FOLDER;
const LOCAL_FACES_FOLDER = config.LOCAL_FACES_FOLDER;
const LOCAL_COMPRESSED_FOLDER = config.LOCAL_COMPRESSED_FOLDER;


/******************** PASSED TEST BELOW ********************/
// GET AN IMAGE THAT CONTAINS CERTAIN FACE
router.get('/users/:userId/faces/:faceId/imageFilename', async (req, res, next) => {
    const faceId = req.params.faceId;
    try {
        const result = await imageService.findByFaceId(faceId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// GET AN IMAGE DOCUMENT
router.get('/users/:userId/images/:imageFilename', async (req, res, next) => {
    const imageFilename = req.params.imageFilename;
    try {
        const result = await imageService.findByFilename(imageFilename);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// GET AN IMAGE DATA FILE FOR DISPLAYING (original file)
router.get('/users/:userId/images/:imageFilename/original', async (req, res, next) => {
    const imageFilename = req.params.imageFilename;
    try {
        const data = await awsService.s3.getObject(IMAGES_FOLDER, imageFilename);
        res.status(200).send(data.Body);
    } catch (err) {
        next(err);
    }
});

// GET AN IMAGE DATA FILE FOR DISPLAYING (compressed file)
router.get('/users/:userId/images/:imageFilename/compressed', async (req, res, next) => {
    const imageFilename = req.params.imageFilename;
    try {
        const data = await awsService.s3.getObject(COMPRESSED_FOLDER, imageFilename);
        res.status(200).send(data.Body);
    } catch (err) {
        next(err);
    }
});

// GET ALL IMAGES AGGREGATE BY TIME
router.get('/users/:userId/images', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const result = await imageService.findByOwner(userId);
        res.status(200).json({data: result});
    } catch(err) {
        next(err)
    }
});

// DELETE A IMAGE BY ITS FILENAME
router.delete('/users/:userId/images/:imageFilename', async (req, res, next) => {
    const userId = req.params.userId;
    const imageFilename = req.params.imageFilename;
    try {
        const result = await imageService.deleteByFilename(imageFilename);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

/*
 * A user upload a image, which is a multipart image file.
 * The image will be uploaded to local disk first and then return
 * the randomly given filename.
 *
 * req.body ==> { imageUpload: <multipart/form-data> }
 * res ==> (200) : { data: <{filename: string}> }
 */
router.post('/users/:userId/images', uploader.single('imageUpload'), async (req, res, next) => {
    const userId = req.params.userId;
    try {
        if (req.file) {
            const imageFilename = req.file.filename;
            res.status(200).json({data: {filename: imageFilename}});
        }
    } catch (err) {
        next(err);
    }
});

/*
 * Detect faces in the uploaded image which is stored in local disk and not uploaded
 * to AWS S3 yet, if faces are detected then put the image onto s3 cloud, and store
 * the image document to database, otherwise, do nothing.
 *
 * res ==> (200) : { data: FaceDetail[] } }
 */
router.get('/users/:userId/images/:imageFilename/analysis', async (req, res, next) => {
    const userId = req.params.userId;
    const imageFilename = req.params.imageFilename;
    try {
        const faceDetails = (await awsService.rekognition.detectFaces(imageFilename)).FaceDetails;
        if (faceDetails.length) {
            const crops = await utils.generateThumbnail(imageFilename, faceDetails);
            console.log(crops);

            await utils.compressImageInSize(imageFilename);
            await awsService.s3.putObject(IMAGES_FOLDER, imageFilename);
            await awsService.s3.putObject(COMPRESSED_FOLDER, imageFilename);
            await imageService.save({
                filename: imageFilename,
                owner: userId,
                faceDetails: faceDetails
            });
        }
        res.status(200).json({data: faceDetails}).end();

        // delete files that has been uploaded to s3
        await utils.deleteFile(LOCAL_IMAGES_FOLDER + imageFilename);
        await utils.deleteFile(LOCAL_COMPRESSED_FOLDER + imageFilename);
    } catch (err) {
        next(err);
    }
});

// GET FACE THUMBNAIL IMAGE
router.get('/users/:userId/faceThumbnails/:thumbnailId', async (req, res, next) => {
    const thumbnailId = req.params.thumbnailId;
    try {
        const data = await awsService.s3.getObject(FACES_THUMBNAIL_FOLDER, thumbnailId);
        res.status(200).send(data.Body);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
