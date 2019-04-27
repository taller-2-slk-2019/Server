var express = require('express');
var router = express.Router();

var channelsController = require('../controllers/ChannelsController');

router.get('/', channelsController.get);

router.get('/:id', channelsController.getChannel);

router.post('/', channelsController.create);

router.get('/:id/users', channelsController.getChannelUsers);

router.post('/:id/users', channelsController.addUser);

router.delete('/:id/users/:userId', channelsController.removeUser);

module.exports = router;