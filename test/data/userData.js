var randtoken = require('rand-token');

var userCreateData = function() {
    return {
        name: "Pepe",
        token: randtoken.generate(20),
        email: "pepe@gmail.com",
        picture: "default.jpg",
    }
};

module.exports = { 
    userCreateData: userCreateData,
};