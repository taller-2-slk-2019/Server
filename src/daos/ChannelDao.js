var TitoBotService = require('../services/TitoBotService');
var UserDao = require('./UserDao');
var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Channel = models.channel;
var { ChannelNotFoundError, UserNotBelongsToOrganizationError } = require('../helpers/Errors');

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

        TitoBotService.channelCreated(channelModel);
        return channelModel;
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

}

module.exports = new ChannelDao();