var express = require('express');
var router = express.Router();

var channelsController = require('../controllers/ChannelsController');

router.post('/create', channelsController.create);

router.patch('/:id/addUser/:userId', channelsController.addUser);

module.exports = router;