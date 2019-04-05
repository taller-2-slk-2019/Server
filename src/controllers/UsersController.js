var logger = require('logops');
var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');
var { InvalidLocationError } = require('../helpers/Errors');
var Token = require('../helpers/Token');

class UsersController{

    async register(req, res){
        var data = {
            name: req.body.name,
            username: req.body.username ? req.body.username : Token.generateRandomUsername(req.body.email),
            token: req.body.token,
            email: req.body.email,
            picture: req.body.picture
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
        var token = req.query.userToken;

        try{
            var user = await UserDao.findByToken(token);
            sendSuccessResponse(res, user);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async get(req, res) {
        var organizationId = req.query.organizationId;

        try{
            var users = await OrganizationDao.findOrganizationUsers(organizationId);
            sendSuccessResponse(res, users);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }
    
    async updateProfile(req, res) {
        var data = {
            name: req.body.name,
            username: req.body.username,
            picture: req.body.picture
        };

        try{
            var token = req.query.userToken;
            await UserDao.update(data, token);
            logger.info("User " + token + " updated");
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

            var token = req.query.userToken;
            await UserDao.update(data, token);
            logger.info("Location from user " + token + " updated");
            sendEmptySuccessResponse(res);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new UsersController();
