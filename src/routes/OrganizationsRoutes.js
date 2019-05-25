var express = require('express');
var router = express.Router();

var organizationsController = require('../controllers/OrganizationsController');



router.get('/:id/statistics', organizationsController.getStatistics);

router.get('/:id', organizationsController.getProfile);

router.get('/', organizationsController.get);



router.post('/:id/invitations', organizationsController.inviteUsers);

router.post('/users', organizationsController.addUser);

router.post('/', organizationsController.create);



router.put('/:id/users/:userId', organizationsController.updateUser);

router.put('/:id', organizationsController.updateProfile);




router.delete('/:id/users/:userId', organizationsController.removeUser);

router.delete('/:id/users', organizationsController.removeUser);

router.delete('/:id', organizationsController.delete);



module.exports = router;