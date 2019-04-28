'use strict';
module.exports = (sequelize, DataTypes) => {
  const AdminUser = sequelize.define('adminUser', {
    username: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    password: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    token: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
  }, {
    defaultScope: {
      attributes: { exclude: ['password'] }
    }
  });

  AdminUser.associate = function() {
    // associations can be defined here
  };

  return AdminUser;
};