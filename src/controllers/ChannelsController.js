var ChannelDao = require('../daos/ChannelDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class ChannelsController{

    async create(req, res, next){
        var data = {
            name: req.body.name,
            visibility: req.body.visibility,
            description: req.body.description,
            welcome: req.body.welcome,
            creatorId: req.body.creatorId,
            organizationId: req.body.organizationId
        }

        try{
            var org = await ChannelDao.create(data);
            sendSuccessResponse(res, org);
            
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

}

module.exports = new ChannelsController();