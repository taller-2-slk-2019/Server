var UserDao = require('../daos/UserDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class UsersController{

    async register(req, res, next){
        try{
            var user = await UserDao.create(req.body);
            sendSuccessResponse(res, user);
            
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

}

module.exports = new UsersController();