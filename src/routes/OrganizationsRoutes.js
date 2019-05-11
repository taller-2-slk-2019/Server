var express = require('express');
var router = express.Router();

var organizationsController = require('../controllers/OrganizationsController');

router.get('/', organizationsController.get);

router.post('/', organizationsController.create);

router.post('/:id/invitations', organizationsController.inviteUsers);

router.post('/users', organizationsController.addUser);

router.put('/:id/users/:userId', organizationsController.updateUser);

router.delete('/:id/users/:userId', organizationsController.removeUser);

router.get('/:id', organizationsController.getProfile);

router.get('/:id/statistics', organizationsController.getStatistics);

router.delete('/:id', organizationsController.delete);


module.exports = router;