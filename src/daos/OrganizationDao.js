var FirebaseController = require('../firebase/FirebaseController');
var Token = require('../helpers/Token');
var { forEach } = require('p-iteration');
var logger = require('logops');
var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.organization;
var OrganizationUserInvitation = models.organizationUserInvitation;
var { UserNotBelongsToOrganizationError,
             InvalidOrganizationInvitationTokenError, OrganizationNotFoundError} = require('../helpers/Errors');
var UserRoleCreator = require('../models/userRoles/UserRoleCreator');
var UserRoleMember = require('../models/userRoles/UserRoleMember');

class OrganizationDao{

    async create(organization){
        var user = await UserDao.findByToken(organization.creatorToken);

        var org = await Organization.create(organization);
        await org.addUser(user, { through: {role: (new UserRoleCreator()).name } });

        return org;
    }

    async findById(id){
        var org = await Organization.findByPk(id);
        if (!org){
            throw new OrganizationNotFoundError(id);
        }
        return org;
    }


    async findForUser(userToken){
        var user = await UserDao.findByToken(userToken);

        return await user.getOrganizations();
    }

    async get(){
        return await Organization.findAll();
    }

    async findOrganizationUsers(organizationId){
        var org = await this.findById(organizationId);

        return await org.getUsers();
    }

    async inviteUsers(organizationId, userEmails){
        var organization = await this.findById(organizationId);
        let uniqueUserEmails = [...new Set(userEmails)]; 

        var failed = [];

        await forEach(uniqueUserEmails, async (userEmail) => {
            try{
                var user = await UserDao.findByEmail(userEmail);
            } catch (ex) {
                failed.push(userEmail);
                return;
            }
            

            var existingUser = await organization.hasUser(user);
            if (existingUser){
                failed.push(userEmail);
                return;
            }

            var invitedUser = await organization.hasInvitedUser(user);
            if (invitedUser){
                failed.push(userEmail);
                return;
            }

            var token = Token.generate();
            await organization.addInvitedUser(user, { through: {token: token } });
            logger.info(`User ${userEmail} invited to organization ${organizationId} with token: ${token}`);
            FirebaseController.sendOrganizationInvitationNotification(user, organization);
        });

        return failed;
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

        var channels = await organization.getChannels();
        await forEach(channels, async (channel) => {
            await channel.removeUser(user);
        });
        await organization.removeUser(user);
    }

}

module.exports = new OrganizationDao();
