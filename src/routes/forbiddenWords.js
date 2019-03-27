var express = require('express');
var router = express.Router();

var forbiddenWordsController = require('../controllers/ForbiddenWordsController');

router.get('/:organizationId', forbiddenWordsController.get);

router.post('/:organizationId', forbiddenWordsController.add);

router.delete('/:id', forbiddenWordsController.delete);

module.exports = router;