var logger = require('logops');
var OrganizationDao = require('../daos/OrganizationDao');
var UserRoleDao = require('../daos/UserRoleDao');
var OrganizationService = require('../services/OrganizationService');
var UserService = require('../services/UserService');
var { sendSuccessResponse, sendEmptySuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');
var { checkIsAdmin } = require('../helpers/RequestHelper');

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
            var orgs = [];
            if (user){
                orgs = await UserService.findUserOrganizations(user);
            } else {
                orgs = await OrganizationDao.get();
            }
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

    async updateProfile(req, res) {
        var data = {
            name: req.body.name,
            picture: req.body.picture,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            description: req.body.description,
            welcome: req.body.welcome
        };

        //TODO check roles

        try{
            var org = req.params.id;
            await OrganizationDao.update(data, org);
            logger.info("Organization " + org + " updated");
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async inviteUsers(req, res){
        //TODO check roles
        try{
            var organizationId = req.params.id;
            var userEmails = req.body.userEmails;

            var mails = await OrganizationService.inviteUsers(organizationId, userEmails);

            sendSuccessResponse(res, mails);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async addUser(req, res){
        var token = req.body.token;

        try{
            await OrganizationService.acceptUserInvitation(token);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async removeUser(req, res){
        //TODO check roles
        var userId = req.params.userId;
        var organizationId = req.params.id;

        try{
            await OrganizationService.removeUser(userId, organizationId);
            logger.info(`User ${userId} abandoned organization ${organizationId}`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var organizationId = req.params.id;

        try{
            await checkIsAdmin(req);
            //TODO check roles
            
            await OrganizationDao.delete(organizationId);
            logger.info(`Organization ${organizationId} deleted`);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async updateUser(req, res){
        var organizationId = req.params.id;
        var userId = req.params.userId;
        var role = req.body.role;

        try{
            await checkIsAdmin(req);
            
            await UserRoleDao.updateUserRole(organizationId, userId, role);
            logger.info(`User ${userId} role updated to '${role}' in organization ${organizationId} `);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getStatistics(req, res){
        var organizationId = req.params.id;

        try{      
            var stats = await OrganizationService.getStatistics(organizationId);
            sendSuccessResponse(res, stats);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new OrganizationsController();