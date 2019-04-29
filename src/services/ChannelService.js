var { filter } = require('p-iteration');
var TitoBotService = require('../services/TitoBotService');
var FirebaseService = require('../firebase/FirebaseService');
var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var ChannelDao = require('../daos/ChannelDao');
var MessageStatisticsDao = require('../daos/MessageStatisticsDao');
var ChannelStatistics = require('../models/statistics/ChannelStatistics');
var { UserAlreadyInChannelError, UserNotBelongsToOrganizationError, 
            UserNotBelongsToChannelError } = require('../helpers/Errors');

class ChannelService {
    async getChannelUsers(id){
        var channel = await ChannelDao.findById(id);
        return await channel.getUsers();
    }

    async addUser(channelId, userId){
        var user = await UserDao.findById(userId);
        await this._addUserToChannel(channelId, user);
    }

    async addUsername(channelId, username){
        var user = await UserDao.findByUsername(username);
        await this._addUserToChannel(channelId, user);
    }

    async _addUserToChannel(channelId, user){
        var channel = await ChannelDao.findById(channelId);

        var organization = await channel.getOrganization();

        if (await channel.hasUser(user)){
            throw new UserAlreadyInChannelError(channelId, user.id);
        }

        if (!(await organization.hasUser(user))){
            throw new UserNotBelongsToOrganizationError(organization.id, user.id);
        }

        await channel.addUser(user);
        TitoBotService.userAddedToChannel(channel, user);
        FirebaseService.sendChannelInvitationNotification(user, channel);
    }

    async removeUser(userId, channelId){
        var [channel, user] = await Promise.all([
                    ChannelDao.findById(channelId),
                    UserDao.findById(userId)
                ]);

        if (!(await channel.hasUser(user))){
            throw new UserNotBelongsToChannelError(channelId, userId);
        }

        await channel.removeUser(user);
    }

    async getStatistics(channelId){
        await ChannelDao.findById(channelId);

        var stats = new ChannelStatistics();

        var messageCount = await MessageStatisticsDao.getMessagesCountByChannel(channelId);
        stats.setMessageCount(messageCount);

        return stats;
    }

    async get(organizationId){
        var org = await OrganizationDao.findById(organizationId);
        return await org.getChannels();
    }

    async getForUser(organizationId, userToken, userIsMember){
        var [user, orgChannels] = await Promise.all([
                    UserDao.findByToken(userToken),
                    this.get(organizationId)
                ]);

        var userChannels = await filter(orgChannels, async (channel) => {
            if (userIsMember){
                return await channel.hasUser(user);
            }
            return channel.isPublic && !(await channel.hasUser(user));
        });

        return userChannels;
    }
}

module.exports = new ChannelService();