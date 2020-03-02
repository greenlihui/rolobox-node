const router = require('express').Router();
const faceService = require('../services/face.service');
const awsService = require('../services/aws.service');
const contactService = require('../services/contact.service');
const imageService = require('../services/image.service');
const utils = require('../middleware/utils');

const appConfig = require('../app-config');
const FACES_THUMBNAIL_FOLDER = appConfig.FACES_THUMBNAIL_FOLDER;

// DELETE A FACE
router.delete('/users/:userId/groups/:groupId/contacts/:contactId/faces/:faceId', async (req, res, next) => {
    const faceId = req.params.faceId;
    try {
        const result = await faceService.deleteFace(faceId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

/******************** PASSED TEST BELOW ********************/
// GET ALL FACES IN A IMAGE BY IMAGE ID
router.get('/users/:userId/images/:imageId/faces', async (req, res, next) => {
    const imageId = req.params.imageId;
    try {
        const faces = await faceService.findByImageId(imageId);
        res.status(200).json(faces);
    } catch(err) {
        next(err);
    }
});


// CREATE A NEW FACE, AND ATTACH TO AN EXISTING CONTACTS OR A NEWLY CREATED ONE
// 'EXISTING' OR 'NEW'
router.post('/users/:userId/images/:imageId/faces', async (req, res, next) => {
    const userId = req.params.userId;
    const srcImageFilename = req.params.imageId;
    const thumbnailImageFilename = req.body.thumbnailImageFilename;
    const contactOrigin = req.query.contactOrigin;
    try {
        // upload face thumbnail to aws s3 and then index face to get face record
        await awsService.s3.putObject(FACES_THUMBNAIL_FOLDER, thumbnailImageFilename);
        const indexResult = await awsService.rekognition.indexFace(thumbnailImageFilename, userId);
        const faceRecord = indexResult.FaceRecords[0];

        // save face into database
        const faceDoc = utils.generateFaceDoc(userId, faceRecord);
        const savedFace = await faceService.save(faceDoc);

        // attach face to the src image
        const srcImage = await imageService.findByFilename(srcImageFilename);
        await imageService.attachFace(srcImage, savedFace._id);

        // attach face to contact
        let contactId = '';
        if (contactOrigin === 'EXISTING') {
            contactId = req.body.contactId;
        } else if (contactOrigin === 'NEW') {
            const contact = req.body.contact;
            const savedContact = await contactService.create(contact);
            contactId = savedContact._id;
        } else {
            res.status(400).send({error: 'contactOrigin of ' + contactOrigin + 'is not valid'});
        }
        const result = await contactService.attachFace(contactId, savedFace);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

module.exports = router;
