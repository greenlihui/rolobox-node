const FriendShip = require('../models/friendship.model');

async function getFriendsByUserId(userId) {
    const query1 = FriendShip.find()
        .where('status').equals('APPROVED')
        .where('requester').equals(userId)
        .select('recipient').populate({
            path: 'recipient',
            populate: {
                path: 'profile',
                model: 'Contact',
                populate: {
                    path: 'faces.list',
                    model: 'Face'
                }
            }
        }).exec();
    const query2 = FriendShip.find()
        .where('status').equals('APPROVED')
        .where('recipient').equals(userId)
        .select('requester').populate({
            path: 'requester',
            populate: {
                path: 'profile',
                model: 'Contact',
                populate: {
                    path: 'faces.list',
                    model: 'Face'
                }
            }
        }).exec();
    const [res1, res2] = await Promise.all([query1, query2]);
    return res1.map(r => r.recipient).concat(res2.map(r => r.requester));
}

async function getBlockedByUserId(userId) {
    const block = await FriendShip.find()
        .where('status').equals('BLOCKED')
        .where('requester').equals(userId)
        .select('recipient').populate({
            path: 'recipient',
            populate: {
                path: 'profile',
                model: 'Contact'
            }
        }).exec();
    return block.map(b => b.recipient);
}

function deleteFriend(userId, friendUserId) {
    return FriendShip.deleteOne()
        .where('status').equals('APPROVED')
        .or([
            {requester: userId, recipient: friendUserId},
            {requester: friendUserId, recipient: userId}
        ]).exec();
}

async function blockUser(userId, blockUserId) {
    await FriendShip.deleteOne()
        .or([
            {requester: userId, recipient: blockUserId},
            {requester: blockUserId, recipient: userId}
        ]).exec();
    return (new FriendShip({
        requester: userId,
        recipient: blockUserId,
        status: 'BLOCKED'
    })).save();
}

function unblockUser(userId, unblockUserId) {
    return FriendShip.deleteOne()
        .where('requester').equals(userId)
        .where('recipient').equals(unblockUserId)
        .where('status').equals('BLOCKED')
        .exec();
}


/**
 * A send a friend request to B.
 * 1. if B has blocked A, do nothing
 * 2. if A has blocked B, tell A to unblock B and then resend
 * 3. if B has also sent a request to A, approve the request
 * 4. else save the request
 * @param request
 * @return {Promise<*|Promise<*>>}
 */
async function saveRequest(request) {
    const isBeingBlocked = FriendShip.findOne()
        .where('requester').equals(request.recipient)
        .where('recipient').equals(request.requester)
        .where('status').equals('BLOCKED');
    const isBlocking = FriendShip.findOne()
        .where('requester').equals(request.requester)
        .where('recipient').equals(request.recipient)
        .where('status').equals('BLOCKED').exec();
    const isAlreadyRequested = FriendShip.findOne()
        .where('requester').equals(request.recipient)
        .where('recipient').equals(request.requester)
        .where('status').equals('PENDING').exec();
    return new Promise((resolve, reject) => {
        Promise.all([isBeingBlocked, isBlocking, isAlreadyRequested]).then(result => {
            const [blocked, blocking, requested] = result;
            if (blocked) {
                return resolve('BLOCKED');
            } else if (blocking) {
                return resolve('BLOCKING')
            } else if (requested) {
                approveRequest(requested._id).then(_ => {
                    return resolve('SAVED');
                });
            } else {
                (new FriendShip(request)).save().then(_ => {
                    return resolve('SAVED');
                })
            }
        });
    });
}

async function getFriendRequestsByUserId(userId) {
    return FriendShip.find()
        .where('status').equals('PENDING')
        .where('recipient').equals(userId)
        .populate({
            path: 'requester',
            populate: {
                path: 'profile',
                model: 'Contact'
            }
        })
        .exec();
}

async function approveRequest(requestId) {
    const request = await FriendShip.findById(requestId);
    request.status = 'APPROVED';
    request.friendSince = Date.now();
    return request.save();
}

async function deleteRequestById(requestId) {
    return await FriendShip.findByIdAndDelete(requestId);
}

module.exports = {
    saveRequest: saveRequest,
    approveRequest: approveRequest,
    deleteRequestById: deleteRequestById,
    getFriendRequestsByUserId: getFriendRequestsByUserId,
    getFriendsByUserId: getFriendsByUserId,
    deleteFriend: deleteFriend,
    blockUser: blockUser,
    getBlockedByUserId: getBlockedByUserId,
    unblockUser: unblockUser
};
