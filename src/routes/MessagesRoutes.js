var express = require('express');
var router = express.Router();

var messagesController = require('../controllers/MessagesController');

router.get('/', messagesController.get);

router.post('/', messagesController.create);

module.exports = router;