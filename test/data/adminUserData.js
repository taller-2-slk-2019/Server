var randtoken = require('rand-token');

var adminUserCreateData = function() {
    return {
        username: "pepe" + randtoken.generate(20),
        token: randtoken.generate(20),
        password: randtoken.generate(20)
    }
};

module.exports = { 
    adminUserCreateData: adminUserCreateData,
};