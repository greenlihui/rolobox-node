const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const friendshipSchema = mongoose.Schema({
    requester: {
        type: ObjectId,
        ref: 'User'
    },
    recipient: {
        type: ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'BLOCKED'],
        default: 'PENDING'
    },
    requestOn: {
        type: Date,
        default: Date.now
    },
    friendSince: Date
}, {toJSON: {versionKey: false}});

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;
