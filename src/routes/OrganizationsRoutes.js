var express = require('express');
var router = express.Router();

var organizationsController = require('../controllers/OrganizationsController');

router.get('/', organizationsController.get);

router.get('/:id', organizationsController.getProfile);

router.post('/', organizationsController.create);

router.post('/:id/invitations', organizationsController.inviteUser);

router.post('/:id/users', organizationsController.addUser);

router.delete('/:id/users/:userId', organizationsController.removeUser);


module.exports = router;