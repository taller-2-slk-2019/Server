'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    visibility: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    description: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    welcome: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
  }, {});

  Channel.associate = function(models) {
    Channel.Creator = Channel.belongsTo(models.User, { as: "Creator" });
    Channel.belongsTo(models.Organization);
    Channel.belongsToMany(models.User, { through: models.ChannelUsers });
  };

  return Channel;
};