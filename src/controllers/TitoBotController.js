var logger = require('logops');
const axios = require('axios');
var BotsController = require('./BotsController');

class TitoBotController {

    get titoBotName() { return 'tito'; }
    get titoBotBaseUrl() { return 'https://tito-bot.herokuapp.com/'; }

    async sendMessage(message){
        var bot = {
            name: this.titoBotName,
            url: this.titoBotBaseUrl + 'bot'
        };

        BotsController.sendMessageToBot(bot, message);
    }

    async userAddedToChannel(channel, user){
        var data = {
            bot: this.titoBotName,
            channelId: channel.id,
            userId: user.id
        };

        var url = this.titoBotBaseUrl + 'welcome';

        logger.info(`Tito bot: sending welcome to user ${user.id} in channel ${channel.id}`);
        axios.post(url, data).catch(err => {
            logger.error('Failed message to tito bot');
            logger.error(err);
        });
    }
}

module.exports = new TitoBotController();