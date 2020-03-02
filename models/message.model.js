const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const messageSchema = mongoose.Schema({
    sender: {
        type: ObjectId,
        ref: 'User'
    },
    receiver: {
        type: ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['TEXT', 'CONTACT', 'IMAGE'],
    },
    content: String,
    unread: {
        type: Boolean,
        default: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
