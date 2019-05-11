'use strict';
module.exports = (sequelize) => {
  const Conversation = sequelize.define('conversation', {
  }, {
    paranoid: true
  });

  Conversation.associate = function(models) {
    Conversation.belongsTo(models.organization);
    Conversation.users = Conversation.belongsToMany(models.user, { through: models.conversationUsers });
  };

  return Conversation;
};
