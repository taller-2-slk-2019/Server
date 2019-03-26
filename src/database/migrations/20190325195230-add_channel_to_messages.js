'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('messages', 'channelId', {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'channels',
        key: 'id'
      }
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('messages', 'channelId');
  }
};
