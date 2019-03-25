var express = require('express');
var router = express.Router();

var usersController = require('../controllers/UsersController');

router.get('/:id', usersController.getProfile);

router.post('/register', usersController.register);

router.patch('/:id', usersController.updateProfile);

router.patch('/:id/location', usersController.updateLocation);

router.patch('/organizations/acceptInvitation/:token', usersController.acceptOrganizationInvitation);

router.patch('/:id/organizations/abandon/:organizationId', usersController.abandonOrganization);

router.patch('/:id/channels/abandon/:channelId', usersController.abandonChannel);


module.exports = router;
