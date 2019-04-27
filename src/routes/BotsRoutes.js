var express = require('express');
var router = express.Router();

var messagesController = require('../controllers/MessagesController');

router.post('/messages', messagesController.createBotMessage);

module.exports = router;