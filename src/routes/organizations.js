var express = require('express');
var router = express.Router();

var organizationsController = require('../controllers/OrganizationsController');

router.get('/:id', organizationsController.get);

router.get('/:id/forUser/:userId', organizationsController.getProfileForUser);

router.post('/create', organizationsController.create);

router.patch('/:id/inviteUser', organizationsController.inviteUser);

module.exports = router;