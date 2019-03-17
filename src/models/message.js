'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    type: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
    data: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } }
  }, {});

  Message.associate = function(models) {
    Message.belongsTo(models.User, { as: "Sender" });
  };
  return Message;
};