var express = require('express');
var router = express.Router();

var channelsController = require('../controllers/ChannelsController');

router.post('/create', channelsController.create);

module.exports = router;