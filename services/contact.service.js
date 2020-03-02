const Contact = require('../models/contact.model');
const Face = require('../models/face.model');
const groupService = require('../services/group.service');
const USER_DEFAULT_AVATAR_FILENAME = require('../app-config').USER_DEFAULT_AVATAR_FILENAME;
const imageService = require('./image.service');

function generateDefaultProfile(user) {
    const profile = {
        emails: [{label: 'Personal', address: user.email}],
        phones: [],
        socials: [],
        occupation: {
            company: '',
            position: ''
        },
        faces: {
            list: []
        },
        name: {
            first: '',
            last: ''
        }
    };
    return create(profile);
}

function findByGroupId(groupId) {
    return Contact.find()
        .where('group').equals(groupId)
        .select('-group -socials')
        .exec();
}

async function findByImageFilename(imageFilename) {
    const faces = (await imageService.findByFilename(imageFilename)).faces;
    return Contact.find()
        .where('faces.list').in(faces)
        .select('_id name faces group')
        .populate('group')
        .exec();
}

async function findByFilters(userId, filters) {
    const groups = await groupService.findByUserId(userId);
    const groupIds = groups.map(g => g._id);
    if (filters.length) {
        const faces = await Face.find({$and: filters}).exec();
        const faceIds = faces.map(f => f._id);
        return Contact.find()
            .where('group').in(groupIds)
            .where('faces.list').in(faceIds)
            .select('_id group name faces')
            .populate('group')
            .exec();
    } else {
        return Contact.find()
            .where('group').in(groupIds)
            .select('_id group name faces')
            .populate('group')
            .exec();
    }
}

function create(contact) {
    return (new Contact(contact)).save();
}

async function deleteById(contactId) {
    return (await Contact.findById(contactId)).remove();
}

function findById(contactId) {
    return Contact.findById(contactId)
        .populate('faces.list', '-details')
        .exec();
}

function findByFaceIds(faceIds) {
    return Contact.find()
        .where('faces.list').in(faceIds)
        .select('_id name faces group')
        .populate('faces.list', 'thumbnailImageFilename')
        .exec();
}

function updateById(id, contact) {
    return Contact.findByIdAndUpdate(id, contact, {new: true});
}

async function attachFace(contactId, face) {
    const contact = await findById(contactId);
    if (contact.faces.avatar === USER_DEFAULT_AVATAR_FILENAME) {
        contact.faces.avatar = face.thumbnailImageFilename;
    }
    contact.faces.list.push(face._id);
    return contact.save();
}

function findByFaceId(faceId) {
    return Contact.findOne()
        .where('faces.list').equals(faceId)
        .exec();
}

async function findAllByUserId(userId) {
    const groups = await groupService.findByUserId(userId);
    const groupsIds = groups.map(group => group._id);
    return Contact.find()
        .where('group').in(groupsIds)
        .populate('group')
        .select('_id name group faces')
        .exec();
}

module.exports = {
    findByGroupId: findByGroupId,
    create: create,
    deleteById: deleteById,
    findById: findById,
    updateById: updateById,
    findByFaceId: findByFaceId,
    findAllByUserId: findAllByUserId,
    attachFace: attachFace,
    findByFaceIds: findByFaceIds,
    findByFilters: findByFilters,
    findByImageFilename: findByImageFilename,
    generateDefaultProfile: generateDefaultProfile
};
