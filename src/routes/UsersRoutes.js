var express = require('express');
var router = express.Router();

var usersController = require('../controllers/UsersController');

router.get('/invitations', usersController.getInvitations);

router.get('/statistics', usersController.getStatistics);

router.get('/profile', usersController.getProfile);

router.get('/:id', usersController.getUser);

router.get('/', usersController.get);

router.post('/', usersController.register);

router.put('/', usersController.updateProfile);

router.put('/location', usersController.updateLocation);

router.delete('/invitations/:token', usersController.deleteInvitation);


module.exports = router;
