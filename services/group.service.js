const Group = require('../models/group.model');

function findByUserId(userId) {
    return Group.find({owner: userId}).sort('-date').populate('numContacts').exec();
}

async function create(group) {
    const name = group.name.trim();
    const exists = await Group.findOne()
        .where('owner').equals(group.owner)
        .where('name').equals(name);
    return new Promise((resolve, reject) => {
        if (exists) {
            return reject(new Error('Name Already Exists'));
        } else {
            return resolve((new Group(group)).save());
        }
    });
}

function updateById(id, group) {
    return Group.findByIdAndUpdate(id, group, {new: true}).populate('numContacts').exec();
}

async function deleteById(groupId) {
    return (await Group.findById(groupId)).remove();
}

module.exports = {
    findByUserId: findByUserId,
    create: create,
    updateById: updateById,
    deleteById: deleteById
};

