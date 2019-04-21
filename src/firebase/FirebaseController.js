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

class FirebaseController{
    sendMessage(message){
        // Send message to channel or converation topic
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
        if (tokens.lenght == 0){
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

module.exports = new FirebaseController();