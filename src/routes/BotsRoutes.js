var express = require('express');
var router = express.Router();

var messagesController = require('../controllers/MessagesController');
var botsController = require('../controllers/BotsController');

router.get('/', botsController.get);

router.post('/messages', messagesController.createBotMessage);

router.post('/', botsController.create);

router.delete('/:id', botsController.delete);

module.exports = router;