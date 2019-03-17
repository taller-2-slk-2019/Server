'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('UserRoles', [{
      name: 'creator',
      organization: true,
      channels: true,
      roles: true,
      users: true
    }, {
      name: 'moderator',
      organization: false,
      channels: true,
      roles: true,
      users: true
    }, {
      name: 'member',
      organization: false,
      channels: false,
      roles: false,
      users: false
    }]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('UserRoles');
  }
};
