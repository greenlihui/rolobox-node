const router = require('express').Router();
const aws = require('../middleware/aws');
const rekognition = aws.rekognition;
const s3 = aws.s3;
const uploader = require('../middleware/uploader');
const msgService = require('../services/message.service');
const awsService = require('../services/aws.service');
const utils = require('../middleware/utils');

router.get('/test/conversations', async (req, res, next) => {
    // const result = await msgService.getInChatting('5e3f7d232348196680ad86ab');
    const result = await msgService.getLatestData('5e3f70d79eb25565c7728054', '5e3f7d232348196680ad86ab');
    res.status(200).json(result);
});

router.get('/test/compressImage', async (req, res, next) => {
    const result = await utils.compressImageInSize('fd01de80-3af8-11ea-bc10-cb399744e628');
    res.status(200).send(result);
});

router.get('/test/buckets', async (req, res, next) => {
    try {
        const data = await s3.listBuckets().promise();
        res.status(200).json(data.Buckets);
    } catch (err) {
        next(err);
    }
});

router.get('/test/collections', async (req, res, next) => {
    try {
        const data = await rekognition.listCollections().promise();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

router.get('/test/collections/:collectionId', async (req, res, next) => {
    const collectionId = req.params.collectionId;
    try {
        const data = await rekognition.describeCollection({CollectionId: collectionId}).promise();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

router.post('/test/objects', uploader.single('imageUpload'), async (req, res, next) => {
    const file = req.file;
    try {
        const result = await awsService.s3.putObject('images/', file.filename);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.delete('/test/collections/:collectionId', async (req, res, next) => {
    const collectionId = req.params.collectionId;
    try {
        const result = await rekognition.deleteCollection({CollectionId: collectionId}).promise();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// DELETE ALL COLLECTIONS!!!
router.delete('/test/you-are-clear-what-you-are-doing/collections', async (req, res, next) => {
    try {
        const collectionIds = (await rekognition.listCollections().promise()).CollectionIds;
        let promiseArray = [];
        for (let i = 0; i < collectionIds.length; i++) {
            const p = rekognition.deleteCollection({CollectionId: collectionIds[i]}).promise();
            promiseArray.push(p);
        }
        const result = await Promise.all(promiseArray);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});


router.delete('/test/collections/:collectionId/faces', async (req, res, next) => {
    const collectionId = req.params.collectionId;
    try {
        const faces = await rekognition.listFaces({CollectionId: collectionId}).promise();
        const faceIds = faces.Faces.map(f => f.FaceId);
        const result = await rekognition.deleteFaces({CollectionId: collectionId, FaceIds: faceIds}).promise();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});


router.post('/test/collections', async (req, res, next) => {
    const params = req.body; // {CollectionId: ******}
    try {
        const result = await rekognition.createCollection(params).promise();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.get('/test/collections/:collectionId/faces', async (req, res, next) => {
    const collectionId = req.params.collectionId;
    try {
        const result = await rekognition.listFaces({CollectionId: collectionId}).promise();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

const mailer = require('../middleware/mailer');
router.get('/test/email', async (req, res, next) => {
    try {
        const mailOptions = {
            from: 'greenlihui@gmail.com',
            to: 'greenlihui@live.com',
            subject: 'Activate your account',
            text: 'Please click the link below to activate your account.\n' +
                'asdfasdf' + '\nIt will be expired in 5 minutes.'
        };
        const result = await mailer.sendMail(mailOptions);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
