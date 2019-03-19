var logger = require('logops');
var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

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

    async acceptOrganizationInvitation(req, res, next){
        var token = req.params.token;

        try{
            await OrganizationDao.acceptUserInvitation(token);
            sendSuccessResponse(res, {accepted: true});
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new UsersController();
