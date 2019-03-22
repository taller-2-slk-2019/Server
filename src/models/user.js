'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    surname: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    email: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    picture: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {});

  User.associate = function(models) {
    User.belongsToMany(models.organization, { through: models.userOrganizations });
  };

  return User;
};