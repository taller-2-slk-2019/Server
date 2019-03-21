var logger = require('logops');

var sendErrorResponse = function(res, err){
    logger.error(err);
    var response = { error : err.message };
    res.status(500).send(response);
}

var sendSuccessResponse = function(res, data){
    res.status(200).send(data);
}

var sendEmptySuccessResponse = function(res){
    sendSuccessResponse(res, {success: true});
}

module.exports = {
    sendErrorResponse: sendErrorResponse,
    sendSuccessResponse: sendSuccessResponse,
    sendEmptySuccessResponse: sendEmptySuccessResponse
}