'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('channels', 'creatorId', {
      allowNull: true,
      type: Sequelize.INTEGER
    });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.changeColumn('channels', 'creatorId', {
          allowNull: true,
          type: Sequelize.INTEGER
        });
  }
};
