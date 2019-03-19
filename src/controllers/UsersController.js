var UserDao = require('../daos/UserDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class UsersController{

    async register(req, res, next){
        var data = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            picture: req.body.picture ? req.body.picture : 'default.jpg'
        }

        try{
            var user = await UserDao.create(data);
            sendSuccessResponse(res, user);
            
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

}

module.exports = new UsersController();