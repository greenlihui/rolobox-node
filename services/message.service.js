const Message = require('../models/message.model');
const userService = require('./user.service');

function save(msg) {
    return (new Message(msg)).save();
}

function getMessages(userId, friendUserId) {
    return Message.find()
        .or([
            {sender: userId, receiver: friendUserId},
            {sender: friendUserId, receiver: userId}
        ]).sort({timestamp: 1}).exec();
}

function setAllRead(userId, friendUserId) {
    return Message.find()
        .where('sender').equals(friendUserId)
        .where('receiver').equals(userId)
        .where('unread').equals(true)
        .updateMany({unread: false})
        .exec();
}

function setOneRead(msgId) {
    return Message.findById(msgId)
        .updateOne({unread: false})
        .exec();
}

async function getInChatting(userId) {
    const msgs = await Message.find()
        .or([
            {sender: userId},
            {receiver: userId}
        ]).select('sender receiver').exec();
    let inChatting = msgs.map(msg => {
        return ((msg.sender.toString() === userId) ? msg.receiver.toString() : msg.sender.toString());
    });
    inChatting = Array.from(new Set(inChatting));
    const promises = inChatting.map(uid => {
        return userService.findById(uid);
    });
    return Promise.all(promises);
}

async function getLatestData(userId, chatUserId) {
    const query1 = Message.findOne()
        .sort({timestamp: -1})
        .or([
            {sender: userId, receiver: chatUserId},
            {sender: chatUserId, receiver: userId}
        ]).exec();
    const query2 = Message
        // .countDocuments({
        //     sender: chatUserId,
        //     receiver: userId,
        //     unread: true
        // }).exec();
        .where('sender').equals(chatUserId)
        .where('receiver').equals(userId)
        .where({'unread': true})
        .countDocuments().exec();
    const [latest, unread] = await Promise.all([query1, query2]);
    return {
        latestMsg: latest,
        unreadCount: unread
    };
}

module.exports = {
    save: save,
    getInChatting: getInChatting,
    getLatestData: getLatestData,
    getMessages: getMessages,
    setAllRead: setAllRead,
    setOneRead: setOneRead
};
