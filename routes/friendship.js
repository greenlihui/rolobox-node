const router = require('express').Router();
const userService = require('../services/user.service');
const fsService = require('../services/friendship.service');


// GET FRIENDS
router.get('/users/:userId/friends', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const result = await fsService.getFriendsByUserId(userId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// DELETE A FRIEND
router.delete('/users/:userId/friends/:friendUserId', async (req, res, next) => {
    const userId = req.params.userId;
    const friendUserId = req.params.friendUserId;
    try {
        const result = await fsService.deleteFriend(userId, friendUserId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// GET BLACK LIST
router.get('/users/:userId/block', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const result = await fsService.getBlockedByUserId(userId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// BLOCK A USER
router.post('/users/:userId/block', async (req, res, next) => {
    const userId = req.params.userId;
    const blockUserId = req.body.blockUserId;
    try {
        const result = await fsService.blockUser(userId, blockUserId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// UNBLOCK A USER
router.delete('/users/:userId/block/:blockUserId', async (req, res, next) => {
    const userId = req.params.userId;
    const blockUserId = req.params.blockUserId;
    try {
        const result = await fsService.unblockUser(userId, blockUserId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

// SEND A FRIEND REQUEST
// req.body: {recipient: email}
router.post('/users/:userId/friend-requests', async (req, res, next) => {
    const userId = req.params.userId;
    const recipientEmail = req.body.recipient;
    try {
        const user = await userService.findByEmail(recipientEmail);
        if (user) {
            const request = {
                requester: userId,
                recipient: user._id
            };
            const saved = await fsService.saveRequest(request);
            res.status(201).json({data: saved});
        } else {
            res.status(400).json({errors: [{detail: ''}]});
        }
    } catch (err) {
        next(err);
    }
});

// APPROVE A FRIEND REQUEST
router.put('/users/:userId/friend-requests/:frId/', async (req, res, next) => {
    const frId = req.params.frId;
    try {
        const updated = await fsService.approveRequest(frId);
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
});

// DELETE A FRIEND REQUEST
router.delete('/users/:userId/friend-requests/:frId', async (req, res, next) => {
    const frId = req.params.frId;
    try {
        const deleted = await fsService.deleteRequestById(frId);
        res.status(200).json(deleted);
    } catch (err) {
        next(err);
    }
});

// GET UNPROCESSED FRIEND REQUESTS
router.get('/users/:userId/friend-requests', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const requests = await fsService.getFriendRequestsByUserId(userId);
        res.status(200).json({data: requests});
    } catch(err) {
        next(err);
    }
});

module.exports = router;
