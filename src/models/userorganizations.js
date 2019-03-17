'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserOrganizations = sequelize.define('UserOrganizations', {
    role: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } }
  }, {});

  UserOrganizations.associate = function(models) {

  };
  return UserOrganizations;
};