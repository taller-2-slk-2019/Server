'use strict';
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('organization', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    picture: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    latitude: { type: DataTypes.FLOAT, allowNull: false, validate: { notNull: true } },
    longitude: { type: DataTypes.FLOAT, allowNull: false, validate: { notNull: true } },
    description: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    welcome: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } }
  }, {});

  Organization.associate = function(models) {
    Organization.belongsToMany(models.user, { through: models.userOrganizations });
    Organization.belongsToMany(models.user, { through: models.organizationUserInvitation, as: 'invitedUsers' });
    Organization.hasMany(models.channel);
    Organization.hasMany(models.conversation);
    Organization.hasMany(models.forbiddenWord);
    Organization.hasMany(models.bot);
  };

  return Organization;
};
