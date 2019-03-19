'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrganizationUserInvitation = sequelize.define('OrganizationUserInvitation', {
    token: DataTypes.STRING
  }, {});
  OrganizationUserInvitation.associate = function(models) {
    // associations can be defined here
  };
  return OrganizationUserInvitation;
};