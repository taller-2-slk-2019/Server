var UserRoleFactory = require('../factories/UserRoleFactory');
var AdminDao = require('../daos/AdminUserDao');
var UserDao = require('../daos/UserDao');
var UserRoleDao = require('../daos/UserRoleDao');
var { UnauthorizedUserError } = require('../helpers/Errors');

class RequestRolePermissions {

    async _checkAdmin(adminToken){
        await AdminDao.findByToken(adminToken);
    }

    async _getUserRole(token, organizationId){
        var user = await UserDao.findByToken(token);
        var role = await UserRoleDao.getUserRole(organizationId, user.id);
        return UserRoleFactory.getRole(role);
    }

    async checkAdminPermissions(req){
        try {
            await this._checkAdmin(req.query.adminToken);
        } catch (err) {
            throw new UnauthorizedUserError();
        }
    }

}

module.exports = new RequestRolePermissions();