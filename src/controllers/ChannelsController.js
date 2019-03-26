var logger = require('logops');
var ChannelDao = require('../daos/ChannelDao');
var MessageDao = require('../daos/MessageDao');
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

    async addUser(req, res){
        var channelId = req.params.id;
        var userId = req.params.userId;
        try{
            await ChannelDao.addUser(channelId, userId);
            logger.info(`User ${userId} added to channel ${channelId}`);
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getMessages(req, res){
        var channelId = req.params.id;
        var page = req.params.page || 1;
        try{
            var messages = await MessageDao.get(channelId, page);
            sendSuccessResponse(res, {messages: messages});

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new ChannelsController();