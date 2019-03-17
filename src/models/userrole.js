'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    organization: { type: DataTypes.BOOLEAN, defaultValue: false },
    channels: { type: DataTypes.BOOLEAN, defaultValue: false },
    roles: { type: DataTypes.BOOLEAN, defaultValue: false },
    users: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    timestamps: false
  });

  UserRole.associate = function(models) {
    // associations can be defined here
  };
  return UserRole;
};