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
}

module.exports = new TitoBotController();