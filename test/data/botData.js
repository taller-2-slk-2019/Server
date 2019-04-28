var randtoken = require('rand-token');

var botCreateData = function() {
    return {
        name: "pepe" + randtoken.generate(20),
        url: "pepe.com"
    }
};

module.exports = { 
    botCreateData: botCreateData,
};