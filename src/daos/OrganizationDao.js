var Token = require('../helpers/Token');
var { filter } = require('p-iteration');
var logger = require('logops');
var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.organization;
var OrganizationUserInvitation = models.organizationUserInvitation;
var { UserAlreadyInvitedError, UserAlreadyInOrganizationError, UserNotBelongsToOrganizationError,
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
        var org = await Organization.findByPk(id, {include: [models.user]});
        if (!org){
            throw new OrganizationNotFoundError(id);
        }
        return org;
    }


    async findProfileForUser(id, userId){
        var org = await this.findById(id);
        var user = await UserDao.findById(userId);

        if (!(await org.hasUser(user))){
            throw new UserNotBelongsToOrganizationError(org.id, user.id);
        }

        var channels = await org.getChannels({include: [models.user]});
        var organization = org.toJSON();
        organization.userChannels = await filter(channels, async (channel) => {
            return await channel.hasUser(user);
        });
        return organization;
    }

    async inviteUser(organizationId, userEmail){
        var organization = await this.findById(organizationId);

        var user = await UserDao.findByEmail(userEmail); 

        var existingUser = await organization.hasUser(user);
        if (existingUser){
            throw new UserAlreadyInOrganizationError(organization.id, user.id);
        }

        var invitedUser = await organization.hasInvitedUser(user);
        if (invitedUser){
            throw new UserAlreadyInvitedError(organization.id, user.id);
        }

        var token = Token.generate();
        await organization.addInvitedUser(user, { through: {token: token } });
        return token;
    }

    async acceptUserInvitation(token){
        var invitation = await OrganizationUserInvitation.findOne(
            {
                where: {token: token},
            });

        if (!invitation){
            throw new InvalidOrganizationInvitationTokenError(token);
        }

        var org = await this.findById(invitation.organizationId);
        var user = await UserDao.findById(invitation.userId);

        await org.addUser(user, { through: {role: (new UserRoleMember()).name } });
        await invitation.destroy();

        logger.info(`User ${user.id} accepted invitation to organization ${org.id}`);
    }

    async removeUser(userId, organizationId){
        var organization = await this.findById(organizationId);
        var user = await UserDao.findById(userId);

        if (!(await organization.hasUser(user))){
            throw new UserNotBelongsToOrganizationError(organizationId, userId);
        }

        await organization.removeUser(user);
    }

}

module.exports = new OrganizationDao();