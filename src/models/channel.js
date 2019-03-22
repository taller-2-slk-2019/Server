'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('channel', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    visibility: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    description: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    welcome: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
  }, {});

  Channel.associate = function(models) {
    Channel.creator = Channel.belongsTo(models.user, { as: "creator" });
    Channel.belongsTo(models.organization);
    Channel.belongsToMany(models.user, { through: models.channelUsers });
  };

  return Channel;
};