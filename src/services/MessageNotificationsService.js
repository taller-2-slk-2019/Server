var logger = require('logops');
var MessageParser = require('../helpers/MessageParser');
var FirebaseService = require('../firebase/FirebaseService');
var ChannelService = require('../services/ChannelService');
var BotDao = require('../daos/BotDao');
var BotsController = require('../controllers/BotsController');
var TitoBot = require('../services/TitoBotService');
var Config = require('../helpers/Config');

class MessageNotificationsService {

    async sendNotification(message){
        await FirebaseService.sendMessage(message);

        if (message.bot || message.conversationId || !Config.messageTypesWithText.includes(message.type)){
            //Don't mention users in conversations or bot's messages
            return;
        }

        var mentionedUsers = MessageParser.getMentionedUsers(message.data);

        if (mentionedUsers.includes(TitoBot.titoBotName)){
            // Tito bot
            TitoBot.sendMessage(message);
            return;
        }

        if (mentionedUsers.length > 0){
            var channel = await message.getChannel();
            // check if first mentioned user is a bot
            var bot = await BotDao.findByName(mentionedUsers[0], channel.organizationId);
            if (bot){
                BotsController.sendMessageToBot(bot, message);
                return;
            }
        }

        await Promise.all([
                    this._notifyMentionedUsers(message, mentionedUsers),
                    this._addNewUsers(message, mentionedUsers)
                ]);
    }

    async _notifyMentionedUsers(message, mentionedUsers){
        var usersToNotify = await this._getAllMessageReceptors(message);

        if (!mentionedUsers.includes(Config.mentionAllUsers)){
            usersToNotify = usersToNotify.filter(username => {
                return mentionedUsers.includes(username);
            });
        }
        
        var sender = await message.getSender();
        usersToNotify = usersToNotify.filter(username => {return username != sender.username;});

        logger.info('Sending user mentioned notifications to: ' + usersToNotify);
        FirebaseService.sendChannelMessageNotification(message, usersToNotify);
    }

    async _addNewUsers(message, mentionedUsers){
        var channelUsers = await this._getAllMessageReceptors(message);

        var newUsers = mentionedUsers.filter(username => {
            return !channelUsers.includes(username);
        });

        logger.info(`Adding to channel ${message.channelId} mentioned users ` + newUsers);
        newUsers.forEach(username => {
            ChannelService.addUsername(message.channelId, username).catch(err => {
                logger.error(`Could not add user ${username} to channel ${message.channelId}`);
                logger.error(err);
            });
        });
    }

    async _getAllMessageReceptors(message){
        var channel = await message.getChannel();
        var users = await channel.getUsers();
        return users.map(user => {return user.username;});
    }
}

module.exports = new MessageNotificationsService();