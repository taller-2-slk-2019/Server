var express = require('express');
var router = express.Router();

var adminUsersController = require('../controllers/AdminUsersController');

router.post('/login', adminUsersController.login);

router.get('/request-stats', adminUsersController.getRequestStats);

module.exports = router;