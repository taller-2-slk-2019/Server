var FirebaseController = require('../firebase/FirebaseController');
var UserDao = require('./UserDao');
var ChannelDao = require('./ChannelDao');
var ConversationDao = require('./ConversationDao');
var models = require('../database/sequelize');
var Message = models.message;
var Config = require('../helpers/Config');
var { UserNotBelongsToChannelError, UserNotBelongsToConversationError, MessageNotFoundError } = require('../helpers/Errors');
var MessageParser = require('../helpers/MessageParser');
var MessageNotifications = require('../controllers/MessageNotificationsController');

class MessageDao{
    async findById(id){
        var msg = await Message.findByPk(id, 
            {include: [{ association: Message.sender, attributes: { exclude: ['token'] }}]});
        if (!msg){
            throw new MessageNotFoundError(id);
        }
        return msg;
    }

    async createForChannel(msg){
        var user = await UserDao.findByToken(msg.senderToken);
        var channel = await ChannelDao.findById(msg.channelId);
        msg.senderId = user.id;

        if (!(await channel.hasUser(user))){
            throw new UserNotBelongsToChannelError(channel.id, user.id);
        }

        var organization = await channel.getOrganization();
        return await this._create(msg, organization);
    }

    async createForConversation(msg){
        var user = await UserDao.findByToken(msg.senderToken);
        var conversation = await ConversationDao.findById(msg.conversationId);
        msg.senderId = user.id;

        if (!(await conversation.hasUser(user))){
            throw new UserNotBelongsToConversationError(conversation.id, user.id);
        }

        var organization = await conversation.getOrganization();
        return await this._create(msg, organization);
    }

    async _create(msg, organization){
        if (Config.messageTypesWithText.includes(msg.type)){
            var forbiddenWords = (await organization.getForbiddenWords()).map((word) => {
                return word.word;
            });

            msg.data = MessageParser.replaceForbiddenWords(msg.data, forbiddenWords);
        }

        var message = await Message.create(msg);
        FirebaseController.sendMessage(await this.findById(message.id));
        MessageNotifications.sendNotification(message);
        return message;
    }

    async getForChannel(channelId, offset){
        var channel = await ChannelDao.findById(channelId);
        return await this._get({ channelId: channel.id }, offset);
    }

    async getForConversation(conversationId, offset){
        var conversation = await ConversationDao.findById(conversationId);
        return await this._get({ conversationId: conversation.id }, offset);
    }

    async findAllByUser(userId) {

        return Message.findAll({
            where: {
                sender: userId
            }
        });
    }

    async _get(where, offset){
        var limit = Config.messagesPerPage;

        return await Message.findAll({
            where: where,
            order: [['id', 'DESC']],
            offset: offset,
            limit: limit,
            include: [{ association: Message.sender, attributes: { exclude: ['token'] }}]
        });
    }

}

module.exports = new MessageDao();