'use strict';
module.exports = (sequelize, DataTypes) => {
  const requestStats = sequelize.define('requestStats', {
    method: DataTypes.STRING,
    statusCode: DataTypes.INTEGER,
    resource: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    responseTime: DataTypes.INTEGER,
    error: DataTypes.STRING
  }, {});

  requestStats.associate = function() {
  };
  
  return requestStats;
};