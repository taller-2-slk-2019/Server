var express = require('express');
var router = express.Router();

var usersController = require('../controllers/UsersController');

router.get('/:id', usersController.getProfile);

router.get('/', usersController.get);

router.post('/', usersController.register);

router.put('/:id', usersController.updateProfile);

router.put('/:id/location', usersController.updateLocation);


module.exports = router;
