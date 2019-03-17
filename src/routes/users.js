var express = require('express');
var router = express.Router();

var usersController = require('../controllers/UsersController');

router.post('/register', usersController.register);

module.exports = router;