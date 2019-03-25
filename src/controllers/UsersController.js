var logger = require('logops');
var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var ChannelDao = require('../daos/ChannelDao');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');
var { InvalidLocationError } = require('../helpers/Errors');

class UsersController{

    async register(req, res){
        var data = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            picture: req.body.picture ? req.body.picture : 'default.jpg'
        };

        try{
            var user = await UserDao.create(data);
            logger.info("User created: " + user.id);
            sendSuccessResponse(res, user);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getProfile(req, res) {
        var id = req.params.id;

        try{
            var user = await UserDao.findById(id);
            sendSuccessResponse(res, user);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }
    
    async updateProfile(req, res) {
        var data = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            picture: req.body.picture ? req.body.picture : 'default.jpg'
        };

        try{
            var id = req.params.id;
            await UserDao.update(data, id);
            logger.info("User " + id + " updated");
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async updateLocation(req, res) {
        var data = {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        };

        try{
            if (!data.latitude || !data.longitude){
                throw new InvalidLocationError();
            }

            var id = req.params.id;
            await UserDao.update(data, id);
            logger.info("Location from user " + id + " updated");
            sendEmptySuccessResponse(res);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async acceptOrganizationInvitation(req, res){
        var token = req.params.token;

        try{
            await OrganizationDao.acceptUserInvitation(token);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async abandonOrganization(req, res){
        var userId = req.params.id;
        var organizationId = req.params.organizationId;

        try{
            await OrganizationDao.removeUser(userId, organizationId);
            logger.info(`User ${userId} abandoned organization ${organizationId}`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async abandonChannel(req, res){
        var userId = req.params.id;
        var channelId = req.params.channelId;

        try{
            await ChannelDao.removeUser(userId, channelId);
            logger.info(`User ${userId} abandoned channel ${channelId}`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new UsersController();
