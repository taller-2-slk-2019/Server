var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class OrganizationsController{

    async get(req, res, next){
        var id = req.params.id;
        try {
            var org = await OrganizationDao.findById(id);
            sendSuccessResponse(res, org);
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

    async create(req, res, next){
        var data = {
            name: req.body.name,
            picture: req.body.picture,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            description: req.body.description,
            welcome: req.body.welcome,
            creatorId: req.body.creatorId
        }

        try{
            var org = await OrganizationDao.create(data);
            sendSuccessResponse(res, org);
            
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

}

module.exports = new OrganizationsController();