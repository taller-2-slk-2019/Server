var logger = require('logops');
const axios = require('axios');
var BotService = require('./BotService');

class TitoBotService {

    get titoBotName() { return 'tito'; }
    get titoBotBaseUrl() { return 'https://tito-bot.herokuapp.com/'; }

    async sendMessage(message){
        var bot = {
            name: this.titoBotName,
            url: this.titoBotBaseUrl + 'bot'
        };

        BotService.sendMessageToBot(bot, message);
    }

    async userAddedToChannel(channel, user){
        var data = {
            bot: this.titoBotName,
            channelId: channel.id,
            userId: user.id
        };

        var url = 'welcome';
        logger.info(`Tito bot: sending welcome to user ${user.id} in channel ${channel.id}`);
        this._sendToTito(url, data);
    }

    async channelCreated(channel){
        var data = {
            bot: this.titoBotName,
            channelId: channel.id,
            userId: channel.creatorId
        };

        var url = 'channel';
        logger.info(`Tito bot: sending creation for channel ${channel.id}`);
        this._sendToTito(url, data);
    }

    async conversationCreated(conversation, user){
        var data = {
            bot: this.titoBotName,
            conversationId: conversation.id,
            userId: user.id
        };

        var url = 'conversation';
        logger.info(`Tito bot: sending creation for conversation ${conversation.id}`);
        this._sendToTito(url, data);
    }

    async _sendToTito(url, data){
        axios.post(this.titoBotBaseUrl + url, data).catch(err => {
            logger.error('Failed message to tito bot: ' + url);
            logger.error(err);
        });
    }
}

module.exports = new TitoBotService();