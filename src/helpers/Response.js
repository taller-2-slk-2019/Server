var logger = require('logops');
var SequelizeValidationError = require('../database/sequelize').Sequelize.ValidationError;
var { HypechatError } = require('./Errors');

class Response {
    sendErrorResponse(res, err){
        logger.error(err);
        var response = { error : err.message };
        res.status(this._getStatusCode(err)).send(response);
    }

    sendSuccessResponse(res, data){
        res.status(200).send(data);
    }

    sendSuccessCreatedResponse(res, data){
        res.status(201).send(data);
    }

    sendEmptySuccessResponse(res){
        res.status(204).send();
    }

    _getStatusCode(err){
        if (err instanceof HypechatError){
            return err.errorCode;
        } else if (err instanceof SequelizeValidationError) {
            return 400;
        }
        return 500;
    }
}

module.exports = new Response();