var sha1 = require('sha1');
var logger = require('logops');
var AdminUserDao = require('../daos/AdminUserDao');
var RequestStatsDao = require('../daos/RequestStatsDao');
var Response = require('../helpers/Response');
var RequestRolePermissions = require('../helpers/RequestRolePermissions');

class AdminUsersController{

    async login(req, res) {
        var username = req.body.username;
        var password = sha1(req.body.password);
        
        try{
            var admin = await AdminUserDao.login(username, password);
            logger.info(`Admin logged in: ${username}`);
            Response.sendSuccessResponse(res, admin);

        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async getRequestStats(req, res) {   
        try{
            await RequestRolePermissions.checkAdminPermissions(req);
            var stats = await RequestStatsDao.get();
            Response.sendSuccessResponse(res, stats);

        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

}

module.exports = new AdminUsersController();
