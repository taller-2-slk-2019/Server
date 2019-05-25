var logger = require('logops');
var ForbiddenWordDao = require('../daos/ForbiddenWordDao');
var RequestRolePermissions = require('../helpers/RequestRolePermissions');
var Response = require('../helpers/Response');
var { InvalidForbiddenWordError } = require('../helpers/Errors');
var Validator = require('../helpers/Validator');

class ForbiddenWordsController{

    async get(req, res){
        var organizationId = req.query.organizationId;

        try{
            var words  = await ForbiddenWordDao.get(organizationId);
            Response.sendSuccessResponse(res, words);
            
        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async add(req, res){
        var data = {
            word: req.body.word,
            organizationId: req.body.organizationId
        };
        
        try{
            await RequestRolePermissions.checkAdminPermissions(req);

            if (!Validator.validateSingleWord(data.word)){
                throw new InvalidForbiddenWordError(data.word);
            }

            var forbiddenWord = await ForbiddenWordDao.create(data);
            logger.info(`Forbidden word '${data.word}' added to organization ${data.organizationId}`);
            Response.sendSuccessCreatedResponse(res, forbiddenWord);

        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var wordId = req.params.id;

        try{
            await RequestRolePermissions.checkAdminPermissions(req);
            
            await ForbiddenWordDao.delete(wordId);
            logger.info(`Forbidden word '${wordId}' deleted`);
            Response.sendEmptySuccessResponse(res);

        } catch (err){
            Response.sendErrorResponse(res, err);
        }
    }

}

module.exports = new ForbiddenWordsController();
