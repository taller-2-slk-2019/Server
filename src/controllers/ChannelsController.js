var logger = require('logops');
var ChannelDao = require('../daos/ChannelDao');
var ChannelService = require('../services/ChannelService');
var Response = require('../helpers/Response');
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
            Response.sendSuccessResponse(res, channel);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
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
            Response.sendEmptySuccessResponse(res);

        } catch (err){
            Response.sendErrorResponse(res, err);
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
            Response.sendSuccessResponse(res, channels);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async getChannel(req, res){
        var id = req.params.id;

        try{
            var channel  = await ChannelDao.findById(id);
            Response.sendSuccessResponse(res, channel);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async getChannelUsers(req, res){
        var id = req.params.id;

        try{
            var users  = await ChannelService.getChannelUsers(id);
            Response.sendSuccessResponse(res, users);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async getChannelNewUsers(req, res){
        var id = req.params.id;

        try{
            var users  = await ChannelService.getChannelNewUsers(id);
            Response.sendSuccessResponse(res, users);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async addUser(req, res){
        var channelId = req.params.id;
        var userId = req.body.userId;
        var userToken = req.query.userToken;
        try{
            if (userId){
                await RequestRolePermissions.checkChannelPermissions(req, channelId);
                await ChannelService.addUser(channelId, userId);
                logger.info(`User ${userId} added to channel ${channelId}`);
            } else {
                await ChannelService.joinUser(channelId, userToken);
                logger.info(`User ${userToken} joined channel ${channelId}`);
            }

            Response.sendEmptySuccessResponse(res);

        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async removeUser(req, res){
        var userId = req.params.userId;
        var channelId = req.params.id;
        var userToken = req.query.userToken;

        try{
            if (userId){
                await RequestRolePermissions.checkChannelPermissions(req, channelId);
                await ChannelService.removeUser(userId, channelId);
                logger.info(`User ${userId} removed from channel ${channelId}`);
            } else {
                await ChannelService.abandonUser(userToken, channelId);
                logger.info(`User ${userToken} abandoned channel ${channelId}`);
            }

            Response.sendEmptySuccessResponse(res);
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async getStatistics(req, res){
        var channelId = req.params.id;

        try{
            var stats = await ChannelService.getStatistics(channelId);
            Response.sendSuccessResponse(res, stats);
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var channelId = req.params.id;

        try{
            await RequestRolePermissions.checkChannelPermissions(req, channelId);
            
            await ChannelDao.delete(channelId);
            logger.info(`Channel ${channelId} deleted`);
            Response.sendEmptySuccessResponse(res);
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

}

module.exports = new ChannelsController();