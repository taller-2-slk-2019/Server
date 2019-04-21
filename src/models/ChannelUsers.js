'use strict';
module.exports = (sequelize) => {
  const ChannelUsers = sequelize.define('channelUsers', {

  }, {});
  ChannelUsers.associate = function() {
    // associations can be defined here
  };
  return ChannelUsers;
};
