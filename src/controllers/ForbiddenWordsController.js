var logger = require('logops');
var ForbiddenWordDao = require('../daos/ForbiddenWordDao');
var { checkIsAdmin } = require('../helpers/RequestHelper');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');

class ForbiddenWordsController{

    async get(req, res){
        var organizationId = req.query.organizationId;

        try{
            var words  = await ForbiddenWordDao.get(organizationId);
            sendSuccessResponse(res, words);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async add(req, res){
        var data = {
            word: req.body.word,
            organizationId: req.body.organizationId
        };
        
        try{
            await checkIsAdmin(req);

            var forbiddenWord = await ForbiddenWordDao.create(data);
            logger.info(`Forbidden word '${data.word}' added to organization ${data.organizationId}`);
            sendSuccessResponse(res, forbiddenWord);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var wordId = req.params.id;

        try{
            await checkIsAdmin(req);
            
            await ForbiddenWordDao.delete(wordId);
            logger.info(`Forbidden word '${wordId}' deleted`);
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new ForbiddenWordsController();
