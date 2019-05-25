var express = require('express');
var router = express.Router();

var channelsController = require('../controllers/ChannelsController');



router.get('/:id/new-users', channelsController.getChannelNewUsers);

router.get('/:id/users', channelsController.getChannelUsers);

router.get('/:id/statistics', channelsController.getStatistics);

router.get('/:id', channelsController.getChannel);

router.get('/', channelsController.get);



router.post('/:id/users', channelsController.addUser);

router.post('/', channelsController.create);



router.put('/:id', channelsController.updateChannel);



router.delete('/:id/users/:userId', channelsController.removeUser);

router.delete('/:id/users', channelsController.removeUser);

router.delete('/:id', channelsController.delete);



module.exports = router;