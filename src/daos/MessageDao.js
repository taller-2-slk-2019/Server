var UserDao = require('./UserDao');
var ChannelDao = require('./ChannelDao');
var models = require('../database/sequelize');
var Message = models.message;
var Config = require('../helpers/Config');
var { UserNotBelongsToChannelError } = require('../helpers/Errors');
var MessageParser = require('../helpers/MessageParser');

class MessageDao{

    async create(msg){
        // TODO send notifications to mentioned users, etc
        var user = await UserDao.findById(msg.senderId);
        var channel = await ChannelDao.findById(msg.channelId);

        if (!(await channel.hasUser(user))){
            throw new UserNotBelongsToChannelError(channel.id, user.id);
        }

        if (Config.messageTypesWithText.includes(msg.type)){
            var organization = await channel.getOrganization();
            var forbiddenWords = (await organization.getForbiddenWords()).map((word) => {
                return word.word;
            });

            msg.data = MessageParser.replaceForbiddenWords(msg.data, forbiddenWords);
        }


        return await Message.create(msg);
    }

    async get(channelId, offset){
        var channel = await ChannelDao.findById(channelId);

        var limit = Config.messagesPerPage;

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