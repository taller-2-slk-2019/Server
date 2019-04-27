var logger = require('logops');
var MessageDao = require('../daos/MessageDao');
var { sendErrorResponse, sendEmptySuccessResponse, sendSuccessResponse } = require('../helpers/ResponseHelper');
var { InvalidMessageTypeError, InvalidMessageDataError, InvalidQueryError } = require('../helpers/Errors');
var Config = require('../helpers/Config');

class MessagesController{

    async create(req, res){
        var data = {
            type: req.body.type,
            data: req.body.data,
            senderToken: req.query.userToken
        };

        try{
            if (! Config.messageTypes.includes(data.type)){
                throw new InvalidMessageTypeError();
            }
            if (!data.data || data.data == ''){
                throw new InvalidMessageDataError();
            }

            if (Number(req.body.channelId)){
                data.channelId = req.body.channelId;
                await MessageDao.createForChannel(data);
                logger.info(`Message sent from user ${data.senderId} to channel ${data.channelId}`);
            } else if (Number(req.body.conversationId)){
                data.conversationId = req.body.conversationId;
                await MessageDao.createForConversation(data);
                logger.info(`Message sent from user ${data.senderId} to conversation ${data.conversationId}`);
            } else {
                throw new InvalidQueryError();
            }
            sendEmptySuccessResponse(res);
            
        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async get(req, res){
        var channelId = req.query.channelId;
        var conversationId = req.query.conversationId;
        var offset = req.query.offset || 0;
        var messages;

        try{
            if (Number(channelId)){
                messages = await MessageDao.getForChannel(channelId, offset);
            } else if (Number(conversationId)){
                messages = await MessageDao.getForConversation(conversationId, offset);
            } else {
                throw new InvalidQueryError();
            }
            
            sendSuccessResponse(res, messages);

        } catch (err){
            sendErrorResponse(res, err);
        }
    }

    async createBotMessage(req, res) {
        var data = {
            type: Config.messageTypesWithText[0],
            data: req.body.message,
            bot: req.body.bot,
            channelId: req.body.channelId
        };

        try {
            await MessageDao.createForBot(data);
            logger.info('Received message from bot: ' + data.bot + " in channel: " + data.channelId);
            sendEmptySuccessResponse(res);
            
        } catch (err) {
            sendErrorResponse(res, err);
        }
    }

}

module.exports = new MessagesController();