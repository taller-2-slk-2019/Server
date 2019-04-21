'use strict';
module.exports = (sequelize, DataTypes) => {
  const firebaseToken = sequelize.define('firebaseToken', {
    token: DataTypes.STRING
  }, {});

  firebaseToken.associate = function() {
    // associations can be defined here
  };

  return firebaseToken;
};