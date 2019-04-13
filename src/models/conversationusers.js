'use strict';
module.exports = (sequelize) => {
  const conversationUsers = sequelize.define('conversationUsers', {
  }, {});

  conversationUsers.associate = function() {
    // associations can be defined here
  };

  return conversationUsers;
};