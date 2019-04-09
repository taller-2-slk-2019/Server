var express = require('express');
var router = express.Router();

var conversationsController = require('../controllers/ConversationsController');

router.get('/', conversationsController.get);

router.post('/', conversationsController.create);

module.exports = router;