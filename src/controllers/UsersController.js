var logger = require('logops');
var UserDao = require('../daos/UserDao');
var OrganizationService = require('../services/OrganizationService');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');
var { InvalidLocationError } = require('../helpers/Errors');
var Token = require('../helpers/Token');
const UserService = require ('../services/UserService');


class UsersController{

    async register(req, res){
        try{
            var data = {
                name: req.body.name,
                username: req.body.username,
                token: req.body.token,
                email: req.body.email,
                picture: req.body.picture
            };

            if (!data.username){
                var username = data.email.split('@')[0];
                var exists = await UserDao.usernameExists(username);
                data.username = exists ? Token.generateRandomUsername(username) : username;
            }

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

    async getUser(req, res) {
        var id = req.params.id;

        try{
            var user = await UserDao.findById(id);
            sendSuccessResponse(res, user);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getInvitations(req, res) {
        var token = req.query.userToken;

        try{
            var invitations = await UserService.findUserInvitations(token);
            var result = invitations.map(invitation => {
                return {token: invitation.organizationUserInvitation.token,
                        organization: invitation,
                        invitedAt: invitation.organizationUserInvitation.createdAt
                       };
            });

            sendSuccessResponse(res, result);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async getStatistics(req, res) {
        var userToken = req.query.userToken;
        var userId = req.params.id;
        var stats;

        try{
            if (userId){
                stats = await UserService.getUserStatistics(userId);
                sendSuccessResponse(res, stats);
            } else {
                stats = await UserService.getStatistics(userToken);
                sendSuccessResponse(res, stats);
            }
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async deleteInvitation(req, res) {
        var token = req.params.token;

        try{
            await UserService.deleteUserInvitation(token);
            sendEmptySuccessResponse(res);
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async get(req, res) {
        var organizationId = req.query.organizationId;

        try{
            var users = await OrganizationService.findOrganizationUsers(organizationId);
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
