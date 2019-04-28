var sha1 = require('sha1');
var logger = require('logops');
var AdminUserDao = require('../daos/AdminUserDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class AdminUsersController{

    async login(req, res) {
        var username = req.body.username;
        var password = sha1(req.body.password);
        
        try{
            var admin = await AdminUserDao.login(username, password);
            logger.info(`Admin logged in: ${username}`);
            sendSuccessResponse(res, admin);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new AdminUsersController();
