var logger = require('logops');
var MessageParser = require('../helpers/MessageParser');
var FirebaseController = require('../firebase/FirebaseController');
var TitoBot = require('../controllers/TitoBotController');
var Config = require('../helpers/Config');

class MessageNotificationsController {

    async sendNotification(message){
        if (message.conversationId || !Config.messageTypesWithText.includes(message.type)){
            //Don't mention users in conversations
            return;
        }

        var mentionedUsers = MessageParser.getMentionedUsers(message.data);

        //TODO chech bots
        if (mentionedUsers.includes(TitoBot.titoBotName)){
            // Tito bot
            TitoBot.sendMessage(message);
            return;
        }

        var usersToNotify = await this._getAllMessageReceptors(message);

        if (!mentionedUsers.includes(Config.mentionAllUsers)){
            usersToNotify = usersToNotify.filter(username => {
                return mentionedUsers.includes(username);
            });
        }
        
        var sender = await message.getSender();
        usersToNotify = usersToNotify.filter(username => {return username != sender.username;});

        logger.info('Sending user mentioned notifications to: ' + usersToNotify);
        FirebaseController.sendChannelMessageNotification(message, usersToNotify);
    }

    async _getAllMessageReceptors(message){
        var channel = await message.getChannel();
        var users = await channel.getUsers();
        return users.map(user => {return user.username;});
    }
}

module.exports = new MessageNotificationsController();