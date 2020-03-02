const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const config = require('../app-config');
const groupService = require('../services/group.service');

const BCRYPT_SALT_ROUNDS = config.BCRYPT_SALT_ROUNDS;

async function save(user) {
    user.password = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
    return (new User(user)).save();
}

function makeVerifiedById(id) {
    return User.findByIdAndUpdate(id, {'status.verified': true}).exec();
}

function findByEmail(email) {
    return User.findOne()
        .where('email').equals(email)
        .populate({
            path: 'profile',
            populate: {
                path: 'faces.list',
                model: 'Face'
            }
        })
        .exec();
}

function findById(userId) {
    return User.findById(userId)
        .populate({
            path: 'profile',
            populate: {
                path: 'faces.list',
                model: 'Face'
            }
        })
        .select('-password').exec();
}

function updateById(id, update) {
    return User.findByIdAndUpdate(id, update, {new: true});
}

// todo first signin
function createUngrouped(userId) {
    const ungrouped = {
        owner: userId,
        color: '#FFFFFF',
        name: 'Ungrouped'
    };
    return groupService.create(ungrouped);
}

module.exports = {
    save: save,
    findById: findById,
    makeVerifiedById: makeVerifiedById,
    findByEmail: findByEmail,
    createUngrouped: createUngrouped,
    updateById: updateById
};
