var FirebaseService = require('../firebase/FirebaseService');
var Token = require('../helpers/Token');
var { forEach } = require('p-iteration');
var logger = require('logops');
var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var UserRoleDao = require('../daos/UserRoleDao');
var MessageStatisticsDao = require('../daos/MessageStatisticsDao');
var models = require('../database/sequelize');
var OrganizationUserInvitation = models.organizationUserInvitation;
var { UserNotBelongsToOrganizationError,
             InvalidOrganizationInvitationTokenError } = require('../helpers/Errors');
var UserRoleMember = require('../models/userRoles/UserRoleMember');
var OrganizationStatistics = require('../models/statistics/OrganizationStatistics');

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

        var [org, user] = await Promise.all([
                    OrganizationDao.findById(invitation.organizationId),
                    UserDao.findById(invitation.userId)
                ]);

        await Promise.all([
            org.addUser(user, { through: {role: (new UserRoleMember()).name } }),
            invitation.destroy()
        ]);

        logger.info(`User ${user.id} accepted invitation to organization ${org.id}`);
    }

    async removeUser(userId, organizationId){
        var [organization, user] = await Promise.all([
                    OrganizationDao.findById(organizationId),
                    UserDao.findById(userId)
                ]);

        if (!(await organization.hasUser(user))){
            throw new UserNotBelongsToOrganizationError(organizationId, userId);
        }

        var [channels, conversations] = await Promise.all([
            organization.getChannels(),
            organization.getConversations()
        ]);
        
        await Promise.all([
            forEach(channels, async (channel) => {
                await channel.removeUser(user);
            }),
            forEach(conversations, async (conversation) => {
                if (await conversation.hasUser(user)){
                    await conversation.destroy();
                }
            })
        ]);

        await organization.removeUser(user);
    }

    async getStatistics(organizationId) {
        var organization = await OrganizationDao.findById(organizationId);

        var [usersCount, messagesCount] = await Promise.all([
                          UserRoleDao.getCountForOrganization(organization.id),
                          MessageStatisticsDao.getMessagesCountByOrganization(organization),
                        ]);
        return new OrganizationStatistics(usersCount, messagesCount);
    }
}

module.exports = new OrganizationService();