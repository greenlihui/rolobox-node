const router = require('express').Router();
const groupService = require('../services/group.service');


// GET ALL GROUPS
router.get('/users/:userId/groups', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const groups = await groupService.findByUserId(userId);
        res.status(200).json({data: groups});
    } catch (err) {
        next(err);
    }
});

// CREATE A GROUP
router.post('/users/:userId/groups', async (req, res, next) => {
    const owner = req.params.userId;
    const group = req.body;
    group.owner = owner;
    if (group.name === undefined || group.name.trim() === '') {
        res.status(400).send('Bad Request');
    } else {
        try {
            const saved = await groupService.create(group);
            res.status(201).json({data: saved});
        } catch (err) {
            next(err);
        }
    }
});

// UPDATE A GROUP
router.put('/users/:userId/groups/:groupId', async (req, res, next) => {
    const groupId = req.params.groupId;
    const group = req.body;
    try {
        const updated = await groupService.updateById(groupId, group);
        res.status(200).json({data: updated});
    } catch (err) {
        next(err);
    }
});

// DELETE A GROUP
router.delete('/users/:userId/groups/:groupId', async (req, res, next) => {
    const groupId = req.params.groupId;
    try {
        const deleted = await groupService.deleteById(groupId);
        res.status(200).json(deleted);
    } catch (err) {
        next(err)
    }
});

module.exports = router;
