'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('channels', 'isPublic', {
          type: Sequelize.BOOLEAN,
          default: true
        }, { transaction: t }),
          queryInterface.removeColumn('channels', 'visibility', { transaction: t }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('channels', 'visibility', {
          type: Sequelize.STRING
        }, { transaction: t }),
          queryInterface.removeColumn('channels', 'isPublic', { transaction: t }),
      ]);
    });
  }
};
