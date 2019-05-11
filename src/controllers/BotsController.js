var logger = require('logops');
var BotDao = require('../daos/BotDao');
var TitoBot = require('../services/TitoBotService');
var { checkIsAdmin } = require('../helpers/RequestHelper');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');
var { InvalidBotError } = require('../helpers/Errors');

class BotsController {

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

            if (data.name.includes(' ') || data.name == TitoBot.titoBotName){
                throw new InvalidBotError(data.name);
            }

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