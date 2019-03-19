var sha1 = require('sha1');
var logger = require('logops');
var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.Organization;
var OrganizationUserInvitation = models.OrganizationUserInvitation;
var { UserAlreadyInvitedError, UserAlreadyInOrganizationError, UserNotFoundError, InvalidOrganizationInvitationTokenError } = require('../helpers/Errors');
var UserRoleCreator = require('../models/userRoles/UserRoleCreator');
var UserRoleMember = require('../models/userRoles/UserRoleMember');

class OrganizationDao{

    async create(organization){
        var user = await UserDao.findById(organization.creatorId);

        if (!user){
            throw new UserNotFoundError(organization.creatorId);
        }

        var org = await Organization.create(organization);
        await org.addUser(user, { through: {role: (new UserRoleCreator()).name } });

        return org;
    }

    async findById(id){
        return await Organization.findByPk(id, 
            { include : [models.User, models.Channel] });
    }

    async inviteUser(organizationId, userId){
        var organization = await this.findById(organizationId);

        var existingUser = (await organization.getUsers()).find((usr) => usr.id == userId);
        if (existingUser){
            throw new UserAlreadyInOrganizationError(organization.id, userId);
        }

        var invitedUser = (await organization.getInvitedUsers()).find((usr) => usr.id == userId);
        if (invitedUser){
            if (invitedUser.OrganizationUserInvitation.hasExpired()){
                await organization.removeInvitedUser(userId);
            } else {
                throw new UserAlreadyInvitedError(organization.id, userId);
            }
        }

        var user = await UserDao.findById(userId);
        if (!user){
            throw new UserNotFoundError(userId);
        }

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

        var org = await this.findById(invitation.OrganizationId);
        var user = await UserDao.findById(invitation.UserId);

        await org.addUser(user, { through: {role: (new UserRoleMember()).name } });
        await invitation.destroy();

        logger.info(`User ${user.id} accepted invitation to organization ${org.id}`);
    }


}

module.exports = new OrganizationDao();