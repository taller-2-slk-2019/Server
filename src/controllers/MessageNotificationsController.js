var MessageParser = require('../helpers/MessageParser');
var FirebaseController = require('../firebase/FirebaseController');
var Config = require('../helpers/Config');

class MessageNotificationsController {

    async sendNotification(message){
        if (message.conversationId || !Config.messageTypesWithText.includes(message.type)){
            //Don't mention users in conversations
            return;
        }

        var mentionedUsers = MessageParser.getMentionedUsers(message.data);

        //TODO check bot tito

        var usersToNotify = await this._getAllMessageReceptors(message);

        if (!mentionedUsers.includes(Config.mentionAllUsers)){
            usersToNotify = usersToNotify.filter(username => {
                return mentionedUsers.includes(username);
            });
        }
        
        var sender = await message.getSender();
        usersToNotify = usersToNotify.filter(username => {return username != sender.username;});

        await FirebaseController.sendChannelMessageNotification(message, usersToNotify);
    }

    async _getAllMessageReceptors(message){
        var channel = await message.getChannel();
        var users = await channel.getUsers();
        return users.map(user => {return user.username;});
    }
}

module.exports = new MessageNotificationsController();