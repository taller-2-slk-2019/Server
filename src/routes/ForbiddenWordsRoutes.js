var express = require('express');
var router = express.Router();

var forbiddenWordsController = require('../controllers/ForbiddenWordsController');

router.get('/', forbiddenWordsController.get);

router.post('/', forbiddenWordsController.add);

router.delete('/:id', forbiddenWordsController.delete);

module.exports = router;