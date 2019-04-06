var randtoken = require('rand-token');
var logger = require('logops');

class Token{

    generate(){
        var token = randtoken.generate(20);
        logger.info("Token generated: " + token);
        return token;
    }

    generateRandomUsername(email){
        if (!email){
            return this.generate();
        }
        var emailName = email.split('@')[0];
        var username = emailName + randtoken.generate(2);
        logger.info("Random username generated: " + username);
        return username;
    }
}

module.exports = new Token();