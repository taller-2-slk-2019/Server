var logger = require('logops');
var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class OrganizationsController{

    async get(req, res){
        var id = req.params.id;
        try {
            var org = await OrganizationDao.findById(id);
            sendSuccessResponse(res, org);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getProfileForUser(req, res){
        var id = req.params.id;
        var userId = req.params.userId;
        try {
            var org = await OrganizationDao.findProfileForUser(id, userId);
            sendSuccessResponse(res, org);
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
            creatorId: req.body.creatorId
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

}

module.exports = new OrganizationsController();