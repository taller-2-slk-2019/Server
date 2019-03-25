var UserDao = require('./UserDao');
var ChannelDao = require('./ChannelDao');
var models = require('../database/sequelize');
var Message = models.message;
var { UserNotBelongsToChannelError } = require('../helpers/Errors');

class MessageDao{

    async create(msg){
        var user = await UserDao.findById(msg.senderId);
        var channel = await ChannelDao.findById(msg.channelId);

        if (!(await channel.hasUser(user))){
            throw new UserNotBelongsToChannelError(channel.id, user.id);
        }

        return await Message.create(msg);
    }

}

module.exports = new MessageDao();