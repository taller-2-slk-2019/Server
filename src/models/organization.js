'use strict';
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    picture: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    latitude: { type: DataTypes.FLOAT, allowNull: false, validate: { notNull: true } },
    longitude: { type: DataTypes.FLOAT, allowNull: false, validate: { notNull: true } },
    description: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    welcome: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } }
  }, {});

  Organization.associate = function(models) {
    Organization.belongsToMany(models.User, { through: models.UserOrganizations });
    Organization.hasMany(models.Channel);
  };

  return Organization;
};