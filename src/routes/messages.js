var express = require('express');
var router = express.Router();

var messagesController = require('../controllers/MessagesController');

router.post('/create', messagesController.create);

module.exports = router;