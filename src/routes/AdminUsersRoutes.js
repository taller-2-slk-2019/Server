var express = require('express');
var router = express.Router();

var adminUsersController = require('../controllers/AdminUsersController');

router.post('/login', adminUsersController.login);

module.exports = router;