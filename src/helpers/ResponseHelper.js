var sendErrorResponse = function(res, err){
    console.log("Error: " + err.message);
    var response = { success: false, error : err.message };
    res.send(response);
}

var sendSuccessResponse = function(res, data){
    var response = { success: true, data : data };
    res.send(response);
}

module.exports = {
    sendErrorResponse: sendErrorResponse,
    sendSuccessResponse: sendSuccessResponse
}