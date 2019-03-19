'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserRoles');
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.createTable('UserRoles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        defaultValue: false,
        type: Sequelize.STRING
      },
      organization: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      channels: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      roles: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      users: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      }
    });
  }
};
