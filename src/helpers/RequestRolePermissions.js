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

    async checkOrganizationPermissions(req, organizationId){
        try {
            await this.checkAdminPermissions(req);
            return;
        } catch (err) {
            // do nothing
        }

        try {
            var role = await this._getUserRole(req.query.userToken, organizationId);
            if (!role.hasOrganizationPermissions()){
                throw new UnauthorizedUserError();
            }
        } catch (err) {
            throw new UnauthorizedUserError();
        }
    }

    async checkChannelPermissions(req, organizationId){
        try {
            await this.checkAdminPermissions(req);
            return;
        } catch (err) {
            // do nothing
        }

        try {
            var role = await this._getUserRole(req.query.userToken, organizationId);
            if (!role.hasChannelsPermissions()){
                throw new UnauthorizedUserError();
            }
        } catch (err) {
            throw new UnauthorizedUserError();
        }
    }

    async checkUserPermissions(req, organizationId){
        try {
            await this.checkAdminPermissions(req);
            return;
        } catch (err) {
            // do nothing
        }

        try {
            var role = await this._getUserRole(req.query.userToken, organizationId);
            if (!role.hasUserPermissions()){
                throw new UnauthorizedUserError();
            }
        } catch (err) {
            throw new UnauthorizedUserError();
        }
    }

}

module.exports = new RequestRolePermissions();