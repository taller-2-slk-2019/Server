'use strict';
module.exports = (sequelize, DataTypes) => {

  const Message = sequelize.define('Message', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});

  Message.associate = function(models) {
    // associations can be defined here
  };

  Message.prototype.getName = function(){
  	return this.firstName + ' ' + this.lastName;
  }

  return Message;
};