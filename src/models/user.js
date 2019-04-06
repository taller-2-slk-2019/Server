'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    email: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    picture: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    token: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true }, unique: true},
    username: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true }, unique: true},
  }, {
    defaultScope: {
      attributes: { exclude: ['token'] }
    }
  });

  User.associate = function(models) {
    User.belongsToMany(models.organization, { through: models.userOrganizations });
    User.belongsToMany(models.organization, { through: models.organizationUserInvitation, as: 'organizationInvitations' });
  };

  return User;
};