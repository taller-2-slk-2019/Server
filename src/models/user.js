'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    surname: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    email: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    picture: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {
    paranoid: true
  });

  User.associate = function(models) {
    User.belongsToMany(models.Organization, { through: models.UserOrganizations });
  };

  return User;
};