const router = require('express').Router();
const msgService = require('../services/message.service');

router.get('/users/:userId/friendsInConversation', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const result = await msgService.getInChatting(userId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

router.get('/users/:userId/friends/:friendUserId/latestMsgData', async (req, res, next) => {
    const userId = req.params.userId;
    const friendUserId = req.params.friendUserId;
    try {
        const result = await msgService.getLatestData(userId, friendUserId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.get('/users/:userId/friends/:friendUserId/messages', async (req, res, next) => {
    const userId = req.params.userId;
    const friendUserId = req.params.friendUserId;
    try {
        const result = await msgService.getMessages(userId, friendUserId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

router.put('/users/:userId/friends/:friendUserId/messages', async (req, res, next) => {
    const userId = req.params.userId;
    const friendUserId = req.params.friendUserId;
    try {
        const result = await msgService.setAllRead(userId, friendUserId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

router.put('/users/:userId/messages/:msgId', async (req, res, next) => {
    const msgId = req.params.msgId;
    try {
        const result = await msgService.setOneRead(msgId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});


module.exports = router;
