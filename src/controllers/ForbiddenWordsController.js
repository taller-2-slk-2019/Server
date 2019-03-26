var logger = require('logops');
var ForbiddenWordDao = require('../daos/ForbiddenWordDao');
var { sendSuccessResponse, sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');

class ForbiddenWordsController{

    async get(req, res){
        var organizationId = req.params.organizationId;

        try{
            var words  = await ForbiddenWordDao.get(organizationId);
            sendSuccessResponse(res, {forbiddenWords: words});
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async add(req, res){
        var data = {
            word: req.body.word,
            organizationId: req.params.organizationId
        };
        try{
            await ForbiddenWordDao.create(data);
            logger.info(`Forbidden word '${data.word}' added to organization ${data.organizationId}`);
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async delete(req, res){
        var wordId = req.params.id;
        try{
            await ForbiddenWordDao.delete(wordId);
            logger.info(`Forbidden word '${wordId}' deleted`);
            sendEmptySuccessResponse(res);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new ForbiddenWordsController();