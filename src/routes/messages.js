var express = require('express');
var router = express.Router();

var messagesController = require('../controllers/MessagesController');

router.get('/', messagesController.index);

router.get('/:id', messagesController.show);

router.post('/', messagesController.create);

router.delete('/:id', messagesController.delete);

module.exports = router;