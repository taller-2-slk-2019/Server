var { HypechatError } = require('../src/helpers/Errors');

class TestException extends HypechatError {
    constructor() {
        super("test", 405);
    }
}

module.exports = new TestException();