var TitoBotService = require('../services/TitoBotService');
var UserDao = require('./UserDao');
var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Channel = models.channel;
var { ChannelNotFoundError, UserNotBelongsToOrganizationError, ChannelAlreadyExistsError } = require('../helpers/Errors');

class ChannelDao{

    async create(channel){
        var user;
        if (channel.creatorToken) {
            user = await UserDao.findByToken(channel.creatorToken);
        }

        var organization = await OrganizationDao.findById(channel.organizationId);
        await this._checkOrganizationChannels(organization, channel);

        if (user){
            if (!(await organization.hasUser(user))){
                throw new UserNotBelongsToOrganizationError(organization.id, user.id);
            }

            channel.creatorId = user.id;
        }
        
        channel.organizationId = organization.id;

        var channelModel = await Channel.create(channel);
        await channelModel.addUser(user);

        TitoBotService.channelCreated(channelModel);
        return channelModel;
    }

    async update(channel_data, id){
        var channel = await this.findById(id);
        var organization = await channel.getOrganization();
        await this._checkOrganizationChannels(organization, channel_data, channel.id);

        await Channel.update(channel_data, {where: {id: id}});
    }

    async findById(id){
        var channel = await Channel.findByPk(id);
        if (!channel){
            throw new ChannelNotFoundError(id);
        }
        return channel;
    }

    async delete(channelId){
        var channel = await this.findById(channelId);
        await channel.destroy();
    }

    async _checkOrganizationChannels(organization, channel, channelId = 0){
        var orgChannels = await organization.getChannels();

        if (orgChannels.some((c) => c.name == channel.name && c.id != channelId)){
            throw new ChannelAlreadyExistsError(channel.name, organization.id);
        }
    }

}

module.exports = new ChannelDao();