var logger = require('logops');
var MessageDao = require('../daos/MessageDao');
var { sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');
var { InvalidMessageTypeError } = require('../helpers/Errors');
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
            await MessageDao.create(data);
            logger.info(`Message sent from user ${data.senderId} to channel ${data.channelId}`);
            sendEmptySuccessResponse(res);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new MessagesController();