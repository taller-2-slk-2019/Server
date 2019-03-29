var express = require('express');
var router = express.Router();

var channelsController = require('../controllers/ChannelsController');

router.get('/', channelsController.get);

router.post('/', channelsController.create);

router.post('/:id/users', channelsController.addUser);

router.delete('/:id/users/:userId', channelsController.removeUser);

module.exports = router;