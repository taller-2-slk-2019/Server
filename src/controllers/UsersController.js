var logger = require('logops');
var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');

class UsersController{

    async register(req, res, next){
        var data = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            picture: req.body.picture ? req.body.picture : 'default.jpg'
        }
        try{
            var user = await UserDao.create(data);
            logger.info("User created: " + user.id);
            sendSuccessResponse(res, user);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getProfile(req, res, next) {
        var id = req.params.id
        try{
            var user = await UserDao.findById(id);
            sendSuccessResponse(res, user);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }
    
    async updateProfile(req, res, next) {
        var data = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            picture: req.body.picture ? req.body.picture : 'default.jpg'
        }
        try{
            var id = req.params.id
            await UserDao.update(data, id);
            logger.info("User " + id + " updated");
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err)
        }
    }

    async updateLocation(req, res, next) {
        var data = {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        }
        try{
            var id = req.params.id
            await UserDao.update(data, id);
            logger.info("Location from user " + id + " updated");
            sendEmptySuccessResponse(res);
            
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

    async acceptOrganizationInvitation(req, res, next){
        var token = req.params.token;

        try{
            await OrganizationDao.acceptUserInvitation(token);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new UsersController();
