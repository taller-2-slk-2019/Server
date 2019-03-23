var randtoken = require('rand-token');
var logger = require('logops');

class Token{

    generate(){
        var token = randtoken.generate(20);
        logger.info("Token generated: " + token);
        return token;
    }
}

module.exports = new Token();