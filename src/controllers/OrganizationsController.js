var logger = require('logops');
var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendEmptySuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class OrganizationsController{

    async getProfile(req, res){
        var id = req.params.id;
        try {
            var org = await OrganizationDao.findById(id);
            sendSuccessResponse(res, org);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async get(req, res){
        var user = req.query.userToken;
        
        try {
            var orgs = await OrganizationDao.findForUser(user);
            sendSuccessResponse(res, orgs);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async create(req, res){
        var data = {
            name: req.body.name,
            picture: req.body.picture,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            description: req.body.description,
            welcome: req.body.welcome,
            creatorToken: req.query.userToken
        };

        try{
            var org = await OrganizationDao.create(data);
            logger.info("Organization created: " + org.id);
            sendSuccessResponse(res, org);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async inviteUser(req, res){
        try{
            var organizationId = req.params.id;
            var userEmail = req.body.userEmail;

            var token = await OrganizationDao.inviteUser(organizationId, userEmail);

            logger.info(`User ${userEmail} invited to organization ${organizationId} with token: ${token}`);
            sendSuccessResponse(res, { token: token });

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async addUser(req, res){
        var token = req.body.token;

        try{
            await OrganizationDao.acceptUserInvitation(token);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async removeUser(req, res){
        var userId = req.params.userId;
        var organizationId = req.params.id;

        try{
            await OrganizationDao.removeUser(userId, organizationId);
            logger.info(`User ${userId} abandoned organization ${organizationId}`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new OrganizationsController();