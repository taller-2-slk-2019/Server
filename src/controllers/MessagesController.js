var logger = require('logops');
var MessageDao = require('../daos/MessageDao');
var { sendErrorResponse, sendEmptySuccessResponse } = require('../helpers/ResponseHelper');

class MessagesController{

    async create(req, res){
        var data = {
            type: req.body.type,
            data: req.body.data,
            senderId: req.body.senderId,
            channelId: req.body.channelId
        };

        try{
            await MessageDao.create(data);
            logger.info(`Message sent from ${data.senderId} to channel ${data.channelId}`);
            sendEmptySuccessResponse(res);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new MessagesController();