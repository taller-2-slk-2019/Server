'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    type: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    data: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    bot: { type: DataTypes.STRING, allowNull: true },
  }, {});

  Message.associate = function(models) {
    Message.sender = Message.belongsTo(models.user, { as: "sender" });
    Message.belongsTo(models.channel);
    Message.belongsTo(models.conversation);
  };
  
  return Message;
};
