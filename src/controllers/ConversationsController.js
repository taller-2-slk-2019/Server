var logger = require('logops');
var ConversationDao = require('../daos/ConversationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class ConversationsController{

    async create(req, res){
        var organizationId = req.body.organizationId;
        var userId = req.body.userId;
        var userToken = req.query.userToken;

        try{
            var conversation  = await ConversationDao.create(organizationId, userId, userToken);
            logger.info(`Conversation created (${conversation.id}) in organization ${organizationId} by user ${userToken} with user ${userId}`);

            sendSuccessResponse(res, conversation);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
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