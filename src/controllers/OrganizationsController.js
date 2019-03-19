var UserDao = require('../daos/UserDao');
var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');
var { UserAlreadyInvitedError, UserAlreadyInOrganizationError, UserNotFoundError } = require('../helpers/Errors');

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
            sendSuccessResponse(res, org);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async inviteUser(req, res, next){
        try{
            var organization = await OrganizationDao.findById(req.params.id);
            var userId = req.params.userId;
            var user = (await organization.getUsers()).find((usr) => usr.id == userId);
            if (user){
                throw new UserAlreadyInOrganizationError(organization.id, userId);
            }

            user = (await organization.getInvitedUsers()).find((usr) => usr.id == userId);
            if (user){
                throw new UserAlreadyInvitedError(organization.id, userId);
            }

            user = await UserDao.findById(userId);
            if (!user){
                throw new UserNotFoundError(userId);
            }

            var token = await OrganizationDao.inviteUser(organization, user);
            sendSuccessResponse(res, { invitationToken: token });

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new OrganizationsController();