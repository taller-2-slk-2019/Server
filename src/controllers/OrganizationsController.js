var logger = require('logops');
var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class OrganizationsController{

    async get(req, res, next){
        var id = req.params.id;
        try {
            var org = await OrganizationDao.findById(id);
            sendSuccessResponse(res, org);
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

    async create(req, res, next){
        var data = {
            name: req.body.name,
            picture: req.body.picture,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            description: req.body.description,
            welcome: req.body.welcome,
            creatorId: req.body.creatorId
        }

        try{
            var org = await OrganizationDao.create(data);
            logger.info("Organization created: " + org.id);
            sendSuccessResponse(res, org);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async inviteUser(req, res, next){
        try{
            var organizationId = req.params.id;
            var userId = req.params.userId;

            var token = await OrganizationDao.inviteUser(organizationId, userId);

            logger.info(`User ${userId} invited to organization ${organizationId} with token: ${token}`);
            sendSuccessResponse(res, { invitationToken: token });

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new OrganizationsController();