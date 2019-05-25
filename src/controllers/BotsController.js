var logger = require('logops');
var BotDao = require('../daos/BotDao');
var TitoBot = require('../services/TitoBotService');
var RequestRolePermissions = require('../helpers/RequestRolePermissions');
var Response = require('../helpers/Response');
var { InvalidBotError } = require('../helpers/Errors');
var Validator = require('../helpers/Validator');

class BotsController {

    async get(req, res){
        var organizationId = req.query.organizationId;

        try{
            var bots  = await BotDao.get(organizationId);
            Response.sendSuccessResponse(res, bots);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async create(req, res){
        var data = {
            name: req.body.name,
            url: req.body.url,
            organizationId: req.body.organizationId
        };
        
        try{
            await RequestRolePermissions.checkAdminPermissions(req);

            if (!Validator.validateSingleWord(data.name) || data.name == TitoBot.titoBotName){
                throw new InvalidBotError(data.name);
            }

            var bot = await BotDao.create(data);
            logger.info(`Bot '${data.name}' added to organization ${data.organizationId}`);
            Response.sendSuccessCreatedResponse(res, bot);

        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var botId = req.params.id;

        try{
            await RequestRolePermissions.checkAdminPermissions(req);
            
            await BotDao.delete(botId);
            logger.info(`Bot '${botId}' deleted`);
            Response.sendEmptySuccessResponse(res);

        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }
}

module.exports = new BotsController();