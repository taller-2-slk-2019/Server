'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('users', 'token', {
          type: Sequelize.STRING,
          unique: true
        }, { transaction: t }),
          queryInterface.removeColumn('users', 'surname', { transaction: t }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('users', 'surname', {
          type: Sequelize.STRING
        }, { transaction: t }),
          queryInterface.removeColumn('users', 'token', { transaction: t }),
      ]);
    });
  }
};
