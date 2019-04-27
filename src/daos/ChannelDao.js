var { filter } = require('p-iteration');
var UserDao = require('./UserDao');
var OrganizationDao = require('./OrganizationDao');
var ChannelStatistics = require('../models/statistics/ChannelStatistics');
var models = require('../database/sequelize');
var Channel = models.channel;
var Message = models.message;
var { ChannelNotFoundError, UserAlreadyInChannelError, UserNotBelongsToOrganizationError, 
            UserNotBelongsToChannelError } = require('../helpers/Errors');

class ChannelDao{

    async create(channel){
        //TODO check user  role, channel name does not exist in org
        var user = await UserDao.findByToken(channel.creatorToken);

        var organization = await OrganizationDao.findById(channel.organizationId);
        if (!(await organization.hasUser(user))){
            throw new UserNotBelongsToOrganizationError(organization.id, user.id);
        }

        channel.creatorId = user.id;
        channel.organizationId = organization.id;

        var channelModel = await Channel.create(channel);
        await channelModel.addUser(user);
        return channelModel;
    }

    async findById(id){
        var channel = await Channel.findByPk(id);
        if (!channel){
            throw new ChannelNotFoundError(id);
        }
        return channel;
    }

    async getChannelUsers(id){
        var channel = await this.findById(id);
        return await channel.getUsers();
    }

    async addUser(channelId, userId){
        var channel = await this.findById(channelId);

        var organization = await channel.getOrganization();

        var user = await UserDao.findById(userId);

        if (await channel.hasUser(user)){
            throw new UserAlreadyInChannelError(channelId, userId);
        }

        if (!(await organization.hasUser(user))){
            throw new UserNotBelongsToOrganizationError(organization.id, userId);
        }

        await channel.addUser(user);
    }

    async removeUser(userId, channelId){
        var channel = await this.findById(channelId);
        var user = await UserDao.findById(userId);

        if (!(await channel.hasUser(user))){
            throw new UserNotBelongsToChannelError(channelId, userId);
        }

        await channel.removeUser(user);
    }

    async get(userToken, organizationId){
        var org = await OrganizationDao.findById(organizationId);
        var user = await UserDao.findByToken(userToken);

        var orgChannels = await org.getChannels();

        var userChannels = await filter(orgChannels, async (channel) => {
            return await channel.hasUser(user);
        });

        return userChannels;
    }

    async getStatistics(channelId){
        await this.findById(channelId);

        var stats = new ChannelStatistics();

        var messageCount = await Message.count({where: {channelId: channelId}});
        stats.setMessageCount(messageCount);

        return stats;
    }

}

module.exports = new ChannelDao();