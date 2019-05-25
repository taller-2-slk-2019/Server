var sha1 = require('sha1');
var logger = require('logops');
var AdminUserDao = require('../daos/AdminUserDao');
var Response = require('../helpers/Response');

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

}

module.exports = new AdminUsersController();
