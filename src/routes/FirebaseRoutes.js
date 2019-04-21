var express = require('express');
var router = express.Router();

var FirebaseTokensController = require('../firebase/FirebaseTokensController');

router.post('/fcm/tokens', FirebaseTokensController.addToken);

router.delete('/fcm/tokens/:token', FirebaseTokensController.removeToken);


module.exports = router;
