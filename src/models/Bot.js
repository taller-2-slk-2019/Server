'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bot = sequelize.define('bot', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    url: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } }
  }, {});

  Bot.associate = function() {
  };

  return Bot;
};