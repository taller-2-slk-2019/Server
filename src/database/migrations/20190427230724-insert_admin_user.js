'use strict';
var randtoken = require('rand-token');

module.exports = {
  up: function(queryInterface) {
    return queryInterface.bulkInsert('adminUsers', [{
      username: 'admin',
      token: randtoken.generate(20),
      password: '7c4a8d09ca3762af61e59520943dc26494f8941b',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: function(queryInterface) {
    return queryInterface.bulkDelete('adminUsers', null, {});
  }
};
