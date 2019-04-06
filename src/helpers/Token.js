var randtoken = require('rand-token');
var logger = require('logops');

class Token{

    generate(){
        var token = randtoken.generate(20);
        logger.info("Token generated: " + token);
        return token;
    }

    generateRandomUsername(username){
        var newUsername = username + randtoken.generate(3).toUpperCase();
        logger.info("Random username generated: " + newUsername);
        return newUsername;
    }
}

module.exports = new Token();