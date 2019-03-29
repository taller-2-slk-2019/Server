var logger = require('logops');
var ChannelDao = require('../daos/ChannelDao');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');

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

    async get(req, res){
        var userId = req.query.userId;
        var organizationId = req.query.organizationId;

        try{
            var channels  = await ChannelDao.get(userId, organizationId);
            sendSuccessResponse(res, channels);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async addUser(req, res){
        var channelId = req.params.id;
        var userId = req.body.userId;
        try{
            await ChannelDao.addUser(channelId, userId);
            logger.info(`User ${userId} added to channel ${channelId}`);
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async removeUser(req, res){
        var userId = req.params.userId;
        var channelId = req.params.id;

        try{
            await ChannelDao.removeUser(userId, channelId);
            logger.info(`User ${userId} abandoned channel ${channelId}`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new ChannelsController();