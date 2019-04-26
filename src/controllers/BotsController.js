var logger = require('logops');
const axios = require('axios');
var Config = require('../helpers/Config');
//var BotDao = require('../daos/BotDao');
//var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');

class BotsController{

    async sendMessageToBot(bot, message) {
        var name = bot.name;
        var msg = message.data.replace(Config.messageUserMentionChar + name).trim();

        var data = {
            bot: name,
            message: msg,
            channelId: message.channelId,
            senderId: message.senderId
        };

        axios.post(bot.url, data);
        logger.info('Sending message to bot: ' + bot.name + " message: " + msg);
    }
}

module.exports = new BotsController();