'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserOrganizations = sequelize.define('userOrganizations', {
    role: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } }
  }, {});

  UserOrganizations.associate = function(models) {

  };
  return UserOrganizations;
};