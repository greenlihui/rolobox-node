const router = require('express').Router();
const contactService = require('../services/contact.service');
const awsService = require('../services/aws.service');
const faceService = require('../services/face.service');
const utils = require('../middleware/utils');


// GET A CONTACT BY ONE OF HIS FACE ID
router.get('/users/:userId/faces/:faceId/contact', async (req, res, next) => {
    const faceId = req.params.faceId;
    try {
        const result = await contactService.findByFaceId(faceId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// GET CONTACTS IN AN IMAGE
router.get('/users/:userId/images/:imageFilename/contacts', async (req, res, next) => {
    const imageFilename = req.params.imageFilename;
    try {
        const result = await contactService.findByImageFilename(imageFilename);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

/******************** PASSED TEST BELOW ********************/

// DELETE A CONTACT
router.delete('/users/:userId/groups/:groupId/contacts/:contactId', async (req, res, next) => {
    const contactId = req.params.contactId;
    try {
        const deleted = await contactService.deleteById(contactId);
        res.status(200).json({data: deleted});
    } catch (err) {
        next(err);
    }
});

// GET CONTACTS BY FILTERS
router.post('/users/:userId/queries/filteredContacts', async (req, res, next) => {
    const userId = req.params.userId;
    const filters = req.body;
    try {
        const processedFilters = utils.processFilters(filters);
        const result = await contactService.findByFilters(userId, processedFilters);
        res.status(200).send({data: result});
    } catch (err) {
        next(err);
    }
});



// GET SIMILAR FACES BY FACE ID
// 1. SEARCH FACES BY THUMBNAIL IMAGE(IN THE LOCAL DISK) TO GET MATCHED AWS FACE IDS
// 2. GET ACCORDING FACE DOCUMENTS
// 3. GET ACCORDING CONTACT DOCUMENTS AND RETURN
router.get('/users/:userId/faces/:faceId/contactsWithSimilarFaces', async (req, res, next) => {
    const userId = req.params.userId;
    const thumbnailImageFilename = req.params.faceId;
    try {
        const result = await awsService.rekognition.searchSimilarFaces(userId, thumbnailImageFilename);
        const awsFaceIds = result.FaceMatches.map(faceMatch => faceMatch.Face.FaceId);
        const matchedFaces = await faceService.findByAWSFaceIds(awsFaceIds);
        const matchedFaceIds = matchedFaces.map(f => f._id);
        const contacts = await contactService.findByFaceIds(matchedFaceIds);
        res.status(200).json({data: contacts});
    } catch (err) {
        next(err);
    }
});

// CREATE A CONTACT
router.post('/users/:userId/groups/:groupId/contacts', async (req, res, next) => {
    const contact = req.body;
    try {
        const saved = await contactService.create(contact);
        res.status(201).json({data: saved});
    } catch (err) {
        next(err);
    }
});

// GET A CONTACT
router.get('/users/:userId/groups/:groupId/contacts/:contactId', async (req, res, next) => {
    const contactId = req.params.contactId;
    try {
        const contact = await contactService.findById(contactId);
        res.status(200).json({data: contact});
    } catch (err) {
        next(err);
    }
});

// UPDATE A CONTACT
router.put('/users/:userId/groups/:groupId/contacts/:contactId', async (req, res, next) => {
    const contactId = req.params.contactId;
    const contact = req.body;
    try {
        const result = await contactService.updateById(contactId, contact);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// GET CONTACTS IN A GROUP
// USE FOR CONTACTS COMPONENT DISPLAYING CONTACTS
// GROUP AND SOCIALS PROPERTIES ARE EMITTED
router.get('/users/:userId/groups/:groupId/contacts', async (req, res, next) => {
    const groupId = req.params.groupId;
    try {
        const result = await contactService.findByGroupId(groupId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// GET ALL CONTACTS OF A USER
// USE FOR ATTACH FACE DIALOG
// ONLY NAME AND _ID PROPERTY ARE RETURNED
router.get('/users/:userId/contacts', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const result = await contactService.findAllByUserId(userId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

module.exports = router;
