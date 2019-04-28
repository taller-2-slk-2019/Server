var logger = require('logops');
const axios = require('axios');
var Config = require('../helpers/Config');
var BotDao = require('../daos/BotDao');
var { checkIsAdmin } = require('../helpers/RequestHelper');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');

class BotsController {

    async sendMessageToBot(bot, message) {
        var name = bot.name;
        var msg = message.data.replace(Config.messageUserMentionChar + name, '').trim();

        var data = {
            bot: name,
            message: msg,
            channelId: message.channelId,
            senderId: message.senderId
        };

        logger.info('Sending message to bot: ' + bot.name + " with message: " + msg);
        axios.post(bot.url, data).catch(err => {
            logger.error('Failed message to bot: ' + bot.name);
            logger.error(err);
        });
    }

    async get(req, res){
        var organizationId = req.query.organizationId;

        try{
            var bots  = await BotDao.get(organizationId);
            sendSuccessResponse(res, bots);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async create(req, res){
        var data = {
            name: req.body.name,
            url: req.body.url,
            organizationId: req.body.organizationId
        };
        
        try{
            await checkIsAdmin(req);

            var bot = await BotDao.create(data);
            logger.info(`Bot '${data.name}' added to organization ${data.organizationId}`);
            sendSuccessResponse(res, bot);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var botId = req.params.id;

        try{
            await checkIsAdmin(req);
            
            await BotDao.delete(botId);
            logger.info(`Bot '${botId}' deleted`);
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }
}

module.exports = new BotsController();