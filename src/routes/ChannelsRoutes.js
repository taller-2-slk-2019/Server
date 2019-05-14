var express = require('express');
var router = express.Router();

var channelsController = require('../controllers/ChannelsController');

router.get('/', channelsController.get);

router.post('/', channelsController.create);

router.get('/:id', channelsController.getChannel);

router.put('/:id', channelsController.updateChannel);

router.delete('/:id', channelsController.delete);

router.get('/:id/users', channelsController.getChannelUsers);

router.post('/:id/users', channelsController.addUser);

router.delete('/:id/users/:userId', channelsController.removeUser);

router.delete('/:id/users', channelsController.removeUser);

router.get('/:id/statistics', channelsController.getStatistics);

module.exports = router;