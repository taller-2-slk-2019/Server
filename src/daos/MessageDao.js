var UserDao = require('./UserDao');
var ChannelDao = require('./ChannelDao');
var models = require('../database/sequelize');
var Message = models.message;
var Config = require('../helpers/Config');
var { UserNotBelongsToChannelError } = require('../helpers/Errors');

class MessageDao{

    async create(msg){
        // TODO send notifications to mentioned users, etc
        var user = await UserDao.findById(msg.senderId);
        var channel = await ChannelDao.findById(msg.channelId);

        if (!(await channel.hasUser(user))){
            throw new UserNotBelongsToChannelError(channel.id, user.id);
        }

        return await Message.create(msg);
    }

    async get(channelId, page){
        var channel = await ChannelDao.findById(channelId);

        var limit = Config.messagesPerPage;
        var offset = (page - 1) * limit;

        return await Message.findAll({
            where: { channelId: channel.id },
            order: [['id', 'DESC']],
            offset: offset,
            limit: limit,
            include: [Message.sender]
        });
    }

}

module.exports = new MessageDao();