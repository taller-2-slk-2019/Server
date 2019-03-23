var UserDao = require('./UserDao');
var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Channel = models.channel;

class ChannelDao{

    async create(channel){
        //TODO check user belongs to organization and role, channel name does not exist in org
        var user = await UserDao.findById(channel.creatorId);

        var organization = await OrganizationDao.findById(channel.organizationId);

        channel.creatorId = user.id;
        channel.organizationId = organization.id;

        var channelModel = await Channel.create(channel);
        await channelModel.addUser(user);
        return channelModel;
    }

}

module.exports = new ChannelDao();