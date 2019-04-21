'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrganizationUserInvitation = sequelize.define('organizationUserInvitation', {
    token: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true } },
  }, {});

  OrganizationUserInvitation.associate = function() {
    // associations can be defined here
  };

  return OrganizationUserInvitation;
};
