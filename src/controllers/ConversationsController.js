var logger = require('logops');
var ConversationDao = require('../daos/ConversationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class ConversationsController{

    async create(req, res){
        var data = {
            name: req.body.name,
            isPublic: req.body.isPublic,
            description: req.body.description,
            welcome: req.body.welcome,
            creatorToken: req.query.userToken,
            organizationId: req.body.organizationId
        };
/*
        try{
            var channel  = await ChannelDao.create(data);
            logger.info(`Channel created (${channel.id}) in organization ${data.organizationId} by user ${data.creatorToken}`);
            sendSuccessResponse(res, channel);
            
        } catch (err){
            sendErrorResponse(res, err);
        }*/
        logger.info(`Channel created`);
         sendSuccessResponse(res,data);
    }

    async get(req, res){
        var userToken = req.query.userToken;
        var organizationId = req.query.organizationId;

        try{
            var conversations  = await ConversationDao.get(userToken, organizationId);
            sendSuccessResponse(res, conversations);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }
}

module.exports = new ConversationsController();