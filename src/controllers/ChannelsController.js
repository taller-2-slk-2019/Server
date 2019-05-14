var logger = require('logops');
var ChannelDao = require('../daos/ChannelDao');
var ChannelService = require('../services/ChannelService');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');
var RequestRolePermissions = require('../helpers/RequestRolePermissions');

class ChannelsController{

    async create(req, res){
        var data = {
            name: req.body.name,
            isPublic: req.body.isPublic,
            description: req.body.description,
            welcome: req.body.welcome,
            creatorToken: req.query.userToken,
            organizationId: req.body.organizationId
        };

        try{
            if (!data.creatorToken){
                await RequestRolePermissions.checkAdminPermissions(req);
            }
            
            var channel  = await ChannelDao.create(data);
            logger.info(`Channel created (${channel.id}) in organization ${data.organizationId} by user ${data.creatorToken}`);
            sendSuccessResponse(res, channel);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async updateChannel(req, res) {
        var data = {
            name: req.body.name,
            isPublic: req.body.isPublic,
            description: req.body.description,
            welcome: req.body.welcome,
        };

        try{
            var channel = req.params.id;
            await RequestRolePermissions.checkChannelPermissions(req, channel);

            await ChannelDao.update(data, channel);
            logger.info("Channel " + channel + " updated");
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async get(req, res){
        var userToken = req.query.userToken;
        var organizationId = req.query.organizationId;
        var userIsMember = req.query.userIsMember;
        if (userIsMember === undefined){
            userIsMember = true; //Default value
        }

        try{
            var channels = [];
            if (userToken){
                channels  = await ChannelService.getForUser(organizationId, userToken, userIsMember);
            } else {
                channels  = await ChannelService.get(organizationId);
            }
            sendSuccessResponse(res, channels);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getChannel(req, res){
        var id = req.params.id;

        try{
            var channel  = await ChannelDao.findById(id);
            sendSuccessResponse(res, channel);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getChannelUsers(req, res){
        var id = req.params.id;

        try{
            var users  = await ChannelService.getChannelUsers(id);
            sendSuccessResponse(res, users);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async addUser(req, res){
        var channelId = req.params.id;
        var userId = req.body.userId;
        try{
            await RequestRolePermissions.checkChannelPermissions(req, channelId);

            await ChannelService.addUser(channelId, userId);
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
            await RequestRolePermissions.checkChannelPermissions(req, channelId);
            
            await ChannelService.removeUser(userId, channelId);
            logger.info(`User ${userId} abandoned channel ${channelId}`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getStatistics(req, res){
        var channelId = req.params.id;

        try{
            var stats = await ChannelService.getStatistics(channelId);
            sendSuccessResponse(res, stats);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var channelId = req.params.id;

        try{
            await RequestRolePermissions.checkChannelPermissions(req, channelId);
            
            await ChannelDao.delete(channelId);
            logger.info(`Channel ${channelId} deleted`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new ChannelsController();