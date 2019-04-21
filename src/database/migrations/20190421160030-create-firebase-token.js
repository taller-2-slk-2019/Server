'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('firebaseTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'users',
            key: 'id'
          }
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING
      }
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('firebaseTokens');
  }
};