var UserDao = require('./UserDao');
var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Channel = models.Channel;
var { UserNotFoundError, OrganizationNotFound } = require('../helpers/Errors');

class ChannelDao{

    async create(channel){
        //TODO check user belongs to organization and role, channel name does not exist in org
        var user = await UserDao.findById(channel.creatorId);

        var organization = await OrganizationDao.findById(channel.organizationId);

        channel.CreatorId = user.id;
        channel.OrganizationId = organization.id;

        return await Channel.create(channel);
    }

}

module.exports = new ChannelDao();