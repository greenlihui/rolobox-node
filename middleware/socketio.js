const _ = require('underscore');
const msgService = require('../services/message.service');

module.exports = function (io) {
    io.on('connection', function socketEvents (socket) {
        socket.on('signin', function (userId) {
            console.log('signin', userId);
            socket.userId = userId;
        });

        socket.on('signout', function (userId) {
            delete socket.userId;
        });

        socket.on('sendMsg', async function (message) {
            const msg = await msgService.save(message);
            const fromSocket = _.findWhere(io.sockets.sockets, {userId: message.sender});
            if (fromSocket) {
                fromSocket.emit('receiveMsg', msg);
            }
            const toSocket = _.findWhere(io.sockets.sockets, {userId: message.receiver});
            if (toSocket) {
                toSocket.emit('receiveMsg', msg);
            }
        });
    });
};
