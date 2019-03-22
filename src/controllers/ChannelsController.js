var logger = require('logops');
var ChannelDao = require('../daos/ChannelDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class ChannelsController{

    async create(req, res){
        var data = {
            name: req.body.name,
            visibility: req.body.visibility,
            description: req.body.description,
            welcome: req.body.welcome,
            creatorId: req.body.creatorId,
            organizationId: req.body.organizationId
        };

        try{
            var channel  = await ChannelDao.create(data);
            logger.info(`Channel created (${channel.id}) in organization ${data.organizationId} by user ${data.creatorId}`);
            sendSuccessResponse(res, channel);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new ChannelsController();