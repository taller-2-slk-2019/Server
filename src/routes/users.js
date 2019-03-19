var express = require('express');
var router = express.Router();

var usersController = require('../controllers/UsersController');

router.get('/:id', usersController.getProfile);

router.post('/register', usersController.register);


module.exports = router;
