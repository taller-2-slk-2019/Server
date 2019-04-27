'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('messages', 'bot', {
          allowNull: true,
          type: Sequelize.STRING
        }, { transaction: t }),
        queryInterface.changeColumn('messages', 'senderId', {
          allowNull: true,
          type: Sequelize.INTEGER,
        }, { transaction: t })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('messages', 'senderId', {
          allowNull: true,
          type: Sequelize.INTEGER,
        }, { transaction: t }),
          queryInterface.removeColumn('messages', 'bot', { transaction: t }),
      ]);
    });
  }
};
