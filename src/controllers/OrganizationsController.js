var OrganizationDao = require('../daos/OrganizationDao');
var { sendSuccessResponse, sendErrorResponse } = require('../helpers/ResponseHelper');

class OrganizationsController{

    async create(req, res, next){
        try{
            var org = await OrganizationDao.create(req.body);
            sendSuccessResponse(res, org);
            
        } catch (err){
            sendErrorResponse(res, err)
        }
    }

}

module.exports = new OrganizationsController();