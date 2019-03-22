var express = require('express');
var router = express.Router();

var organizationsController = require('../controllers/OrganizationsController');

router.get('/:id', organizationsController.get);

router.post('/create', organizationsController.create);

router.patch('/:id/inviteUser', organizationsController.inviteUser);

module.exports = router;