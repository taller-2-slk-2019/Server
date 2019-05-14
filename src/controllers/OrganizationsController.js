var logger = require('logops');
var OrganizationDao = require('../daos/OrganizationDao');
var UserRoleDao = require('../daos/UserRoleDao');
var OrganizationService = require('../services/OrganizationService');
var UserService = require('../services/UserService');
var UserRoleFactory = require('../factories/UserRoleFactory');
var { sendSuccessResponse, sendEmptySuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');
var RequestRolePermissions = require('../helpers/RequestRolePermissions');
var { InvalidUserRoleError } = require('../helpers/Errors');

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
            if (!data.creatorToken){
                await RequestRolePermissions.checkAdminPermissions(req);
            }

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

        try{
            var org = req.params.id;
            await RequestRolePermissions.checkOrganizationPermissions(req, org);

            await OrganizationDao.update(data, org);
            logger.info("Organization " + org + " updated");
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async inviteUsers(req, res){
        try{
            var organizationId = req.params.id;
            var userEmails = req.body.userEmails;

            await RequestRolePermissions.checkUserPermissions(req, organizationId);

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
        var userId = req.params.userId;
        var organizationId = req.params.id;
        var userToken = req.query.userToken;

        try{
            if (userId){
                await RequestRolePermissions.checkUserPermissions(req, organizationId);
                await OrganizationService.removeUser(userId, organizationId);
                logger.info(`User ${userId} removed from organization ${organizationId}`);
            } else {
                await OrganizationService.abandonUser(userToken, organizationId);
                logger.info(`User ${userId} abandoned organization ${organizationId}`);
            }
            
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var organizationId = req.params.id;

        try{
            await RequestRolePermissions.checkOrganizationPermissions(req, organizationId);
            
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
            await RequestRolePermissions.checkOrganizationPermissions(req, organizationId);

            if (!UserRoleFactory.roles.includes(role)){
                throw new InvalidUserRoleError();
            }
            
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