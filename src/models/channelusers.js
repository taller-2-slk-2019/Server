'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChannelUsers = sequelize.define('channelUsers', {
  	
  }, {});
  ChannelUsers.associate = function(models) {
    // associations can be defined here
  };
  return ChannelUsers;
};