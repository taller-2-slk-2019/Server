var express = require('express');
var router = express.Router();

var usersController = require('../controllers/UsersController');

router.get('/profile', usersController.getProfile);

router.get('/', usersController.get);

router.post('/', usersController.register);

router.put('/', usersController.updateProfile);

router.put('/location', usersController.updateLocation);


module.exports = router;
