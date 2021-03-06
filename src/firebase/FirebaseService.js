var firebase = require('firebase-admin');
var logger = require('logops');
var FirebaseTokensDao = require('./FirebaseTokensDao');

var serviceAccount = require('./firebase.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

const CHANNEL_TOPIC = 'channel_';
const CONVERSATION_TOPIC = 'conversation_';

const TYPE_NEW_MESSAGE = 'new_message';
const TYPE_MENTION = 'mention';
const TYPE_INVITATION = 'invitation';
const TYPE_CHANNEL_INVITATION = 'channel_invitation';
const TYPE_CONVERSATION_INVITATION = 'conversation_invitation';

class FirebaseService{
    async sendMessage(message){
        // Send message to channel or conversation topic
        var topic;
        if (message.channelId){
            topic = CHANNEL_TOPIC + message.channelId;
        } else if (message.conversationId){
            topic = CONVERSATION_TOPIC + message.conversationId;
        } else {
            return;
        }

        var data = {
            data: {
                message: JSON.stringify(message),
                type: TYPE_NEW_MESSAGE
            },
            topic: topic
        };

        this._sendToFirebaseTopic(data);
    }

    async sendChannelMessageNotification(message, users){
        var tokens = await FirebaseTokensDao.getForUsers(users);
        if (tokens.length == 0){
            return;
        }

        var channel = await message.getChannel();
        var sender = await message.getSender();

        var data = {
            data: {
                message: JSON.stringify(message),
                channel: JSON.stringify(channel),
                sender: JSON.stringify(sender),
                type: TYPE_MENTION
            }
        };

        this._sendToFirebaseDevices(data, tokens);
    }

    async sendOrganizationInvitationNotification(user, organization){
        var tokens = await FirebaseTokensDao.getForUsers(user.username);
        if (tokens.length == 0){
            return;
        }

        var data = {
            data: {
                organization: JSON.stringify(organization),
                type: TYPE_INVITATION
            }
        };

        this._sendToFirebaseDevices(data, tokens);
    }

    async sendChannelInvitationNotification(user, channel){
        var tokens = await FirebaseTokensDao.getForUsers(user.username);
        if (tokens.length == 0){
            return;
        }

        var data = {
            data: {
                channel: JSON.stringify(channel),
                type: TYPE_CHANNEL_INVITATION
            }
        };

        this._sendToFirebaseDevices(data, tokens);
    }

    async sendConversationInvitationNotification(user, other_user, conversation){
        var tokens = await FirebaseTokensDao.getForUsers(user.username);
        if (tokens.length == 0){
            return;
        }

        var data = {
            data: {
                conversation: JSON.stringify(conversation),
                user: JSON.stringify(other_user),
                type: TYPE_CONVERSATION_INVITATION
            }
        };

        this._sendToFirebaseDevices(data, tokens);
    }

    _sendToFirebaseTopic(data){
        // Send a message to devices subscribed to the provided topic.
        firebase.messaging().send(data)
            .then((response) => {
                // Response is a message ID string.
                logger.info('Firebase: Successfully sent message:', response);
            })
            .catch((error) => {
                logger.error('Firebase: Error sending message:', error);
            });
    }

    _sendToFirebaseDevices(data, tokens){
        firebase.messaging().sendToDevice(tokens, data)
          .then((response) => {
                // Response is a message ID string.
                logger.info('Firebase: Successfully sent message:', response);
            })
            .catch((error) => {
                logger.error('Firebase: Error sending message:', error);
            });
    }

}

module.exports = new FirebaseService();