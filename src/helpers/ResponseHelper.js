var sendErrorResponse = function(res, err){
    console.log('-----------------------------------------------------------------------');
    console.log(err.stack);
    var response = { error : err.message };
    res.status(500).send(response);
}

var sendSuccessResponse = function(res, data){
    res.status(200).send(data);
}

module.exports = {
    sendErrorResponse: sendErrorResponse,
    sendSuccessResponse: sendSuccessResponse
}