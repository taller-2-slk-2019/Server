var logger = require('logops');
var ConversationDao = require('../daos/ConversationDao');
var Response = require('../helpers/Response');

class ConversationsController{

    async create(req, res){
        var organizationId = req.body.organizationId;
        var userId = req.body.userId;
        var userToken = req.query.userToken;

        try{
            var conversation  = await ConversationDao.create(organizationId, userId, userToken);
            logger.info(`Conversation created (${conversation.id}) in organization ${organizationId} by user ${userToken} with user ${userId}`);

            Response.sendSuccessResponse(res, conversation);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async get(req, res){
        var userToken = req.query.userToken;
        var organizationId = req.query.organizationId;

        try{
            var conversations  = await ConversationDao.get(userToken, organizationId);
            Response.sendSuccessResponse(res, conversations);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }
}

module.exports = new ConversationsController();