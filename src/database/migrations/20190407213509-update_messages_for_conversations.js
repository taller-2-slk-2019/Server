'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('messages', 'channelId', {
          allowNull: true,
          type: Sequelize.INTEGER
        }, { transaction: t }),
        queryInterface.addColumn('messages', 'conversationId', {
          allowNull: true,
          type: Sequelize.INTEGER,
          references: {
            model: 'conversations',
            key: 'id'
          }
        }, { transaction: t })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('messages', 'channelId', {
          allowNull: false,
          type: Sequelize.INTEGER
        }, { transaction: t }),
          queryInterface.removeColumn('messages', 'conversationId', { transaction: t }),
      ]);
    });
  }
};
