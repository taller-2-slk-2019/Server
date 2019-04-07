'use strict';
module.exports = (sequelize) => {
  const Conversation = sequelize.define('conversation', {
  }, {});

  Conversation.associate = function(models) {
    Conversation.belongsTo(models.organization);
    Conversation.belongsToMany(models.user, { through: models.conversationUsers });
  };

  return Conversation;
};