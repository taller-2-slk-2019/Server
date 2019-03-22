var sha1 = require('sha1');
var logger = require('logops');
var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.organization;
var OrganizationUserInvitation = models.organizationUserInvitation;
var { UserAlreadyInvitedError, UserAlreadyInOrganizationError, UserNotFoundError,
             InvalidOrganizationInvitationTokenError, OrganizationNotFoundError} = require('../helpers/Errors');
var UserRoleCreator = require('../models/userRoles/UserRoleCreator');
var UserRoleMember = require('../models/userRoles/UserRoleMember');

class OrganizationDao{

    async create(organization){
        var user = await UserDao.findById(organization.creatorId);

        var org = await Organization.create(organization);
        await org.addUser(user, { through: {role: (new UserRoleCreator()).name } });

        return org;
    }

    async findById(id){
        var org = await Organization.findByPk(id, 
            { include : [models.user, models.channel] });
        if (!org){
            throw new OrganizationNotFoundError(id);
        }
        return org;
    }

    async inviteUser(organizationId, userId){
        var organization = await this.findById(organizationId);

        var existingUser = (await organization.getUsers()).find((usr) => usr.id == userId);
        if (existingUser){
            throw new UserAlreadyInOrganizationError(organization.id, userId);
        }

        var invitedUser = (await organization.getInvitedUsers()).find((usr) => usr.id == userId);
        if (invitedUser){
            if (invitedUser.organizationUserInvitation.hasExpired()){
                await organization.removeInvitedUser(userId);
            } else {
                throw new UserAlreadyInvitedError(organization.id, userId);
            }
        }

        var user = await UserDao.findById(userId);

        var token = sha1(Date.now());
        await organization.addInvitedUser(user, { through: {token: token } });
        return token;
    }

    async acceptUserInvitation(token){
        var invitation = await OrganizationUserInvitation.findOne(
            {
                where: {token: token},
            });

        if (!invitation || invitation.hasExpired()){
            throw new InvalidOrganizationInvitationTokenError(token);
        }

        var org = await this.findById(invitation.organizationId);
        var user = await UserDao.findById(invitation.userId);

        await org.addUser(user, { through: {role: (new UserRoleMember()).name } });
        await invitation.destroy();

        logger.info(`User ${user.id} accepted invitation to organization ${org.id}`);
    }


}

module.exports = new OrganizationDao();