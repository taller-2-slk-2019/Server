var randtoken = require('rand-token');

var userCreateData = function() {
    return {
        name: "Pepe",
        username: "pepe" + randtoken.generate(20),
        token: randtoken.generate(20),
        email: "pepe@gmail.com" + randtoken.generate(20),
        picture: "default.jpg",
    }
};

module.exports = { 
    userCreateData: userCreateData,
};