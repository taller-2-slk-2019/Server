var logger = require('logops');
var FirebaseTokensDao = require('./FirebaseTokensDao');
var Response = require('../helpers/Response');

class FirebaseTokensController{
    async addToken(req, res){
        var userToken = req.query.userToken;
        var token = req.body.token;

        try{
            await FirebaseTokensDao.addToken(userToken, token);
            logger.info(`FCM token '${token}' associated to user '${userToken}'`);
            Response.sendEmptySuccessResponse(res);
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async removeToken(req, res){
        var token = req.params.token;

        try{
            await FirebaseTokensDao.removeToken(token);
            logger.info(`FCM token '${token}' deleted`);
            Response.sendEmptySuccessResponse(res);
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }
}

module.exports = new FirebaseTokensController();