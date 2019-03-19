'use strict';

var Config = require ('../helpers/Config');
var moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  const OrganizationUserInvitation = sequelize.define('OrganizationUserInvitation', {
    token: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
  }, {});

  OrganizationUserInvitation.associate = function(models) {
    // associations can be defined here
  };

  OrganizationUserInvitation.prototype.hasExpired = function(){
    return moment(this.createdAt).add(Config.organizationInvitationExpirationDays, 'days').isBefore(moment());
  };

  return OrganizationUserInvitation;
};