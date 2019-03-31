var logger = require('logops');
var MessageDao = require('../daos/MessageDao');
var { sendErrorResponse, sendEmptySuccessResponse, sendSuccessResponse } = require('../helpers/ResponseHelper');
var { InvalidMessageTypeError, InvalidMessageDataError } = require('../helpers/Errors');
var Config = require('../helpers/Config');

class MessagesController{

    async create(req, res){
        var data = {
            type: req.body.type,
            data: req.body.data,
            senderId: req.body.senderId,
            channelId: req.body.channelId
        };

        try{
            if (! Config.messageTypes.includes(data.type)){
                throw new InvalidMessageTypeError();
            }
            if (!data.data || data.data == ''){
                throw new InvalidMessageDataError();
            }

            await MessageDao.create(data);
            logger.info(`Message sent from user ${data.senderId} to channel ${data.channelId}`);
            sendEmptySuccessResponse(res);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async get(req, res){
        var channelId = req.query.channelId;
        var offset = req.query.offset || 0;

        try{
            var messages = await MessageDao.get(channelId, offset);
            sendSuccessResponse(res, messages);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new MessagesController();