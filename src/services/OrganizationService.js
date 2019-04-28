var FirebaseService = require('../firebase/FirebaseService');
var Token = require('../helpers/Token');
var { forEach } = require('p-iteration');
var logger = require('logops');
var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var models = require('../database/sequelize');
var OrganizationUserInvitation = models.organizationUserInvitation;
var { UserNotBelongsToOrganizationError,
             InvalidOrganizationInvitationTokenError } = require('../helpers/Errors');
var UserRoleMember = require('../models/userRoles/UserRoleMember');

class OrganizationService {
    async findOrganizationUsers(organizationId){
        var org = await OrganizationDao.findById(organizationId);
        return await org.getUsers();
    }

    async inviteUsers(organizationId, userEmails){
        var organization = await OrganizationDao.findById(organizationId);
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
            FirebaseService.sendOrganizationInvitationNotification(user, organization);
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

        var org = await OrganizationDao.findById(invitation.organizationId);
        var user = await UserDao.findById(invitation.userId);

        await org.addUser(user, { through: {role: (new UserRoleMember()).name } });
        await invitation.destroy();

        logger.info(`User ${user.id} accepted invitation to organization ${org.id}`);
    }

    async removeUser(userId, organizationId){
        var organization = await OrganizationDao.findById(organizationId);
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

module.exports = new OrganizationService();