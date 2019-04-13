var firebase = require('firebase-admin');
var logger = require('logops');

var serviceAccount = require('./firebase.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

const CHANNEL_TOPIC = 'channel_';
const CONVERSATION_TOPIC = 'conversation_';

const TYPE_NEW_MESSAGE = 'new_message';

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

        this._sendToFirebase(data);
    }

    _sendToFirebase(data){
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

}

module.exports = new FirebaseController();