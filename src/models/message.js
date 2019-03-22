'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    type: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    data: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } }
  }, {});

  Message.associate = function(models) {
    Message.belongsTo(models.user, { as: "sender" });
  };
  return Message;
};