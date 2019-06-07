var UserRoleFactory = require('../factories/UserRoleFactory');
var AdminDao = require('../daos/AdminUserDao');
var UserDao = require('../daos/UserDao');
var UserRoleDao = require('../daos/UserRoleDao');
var ChannelDao = require('../daos/ChannelDao');
var { UnauthorizedUserError } = require('../helpers/Errors');
var Config = require('../helpers/Config');

class RequestRolePermissions {

    async _checkAdmin(adminToken){
        await AdminDao.findByToken(adminToken);
    }

    async _getUserRole(token, organizationId){
        var user = await UserDao.findByToken(token);
        var role = await UserRoleDao.getUserRole(organizationId, user.id);
        return UserRoleFactory.getRole(role);
    }

    async _checkUserRolePermissions(req, organizationId, roleCheck){
        try {
            await this.checkAdminPermissions(req);
            return;
        } catch (err) {
            // do nothing
        }

        try {
            var role = await this._getUserRole(req.query.userToken, organizationId);
            if (!roleCheck(role)){
                throw new UnauthorizedUserError();
            }
        } catch (err) {
            throw new UnauthorizedUserError();
        }
    }

    async checkAdminPermissions(req){
        try {
            await this._checkAdmin(req.query.adminToken);
        } catch (err) {
            throw new UnauthorizedUserError();
        }
    }

    async checkOrganizationPermissions(req, organizationId){
        var roleCheck = (role) => { return role.hasOrganizationPermissions(); };
        await this._checkUserRolePermissions(req, organizationId, roleCheck);
    }

    async checkChannelPermissions(req, channelId){
        var roleCheck = (role) => { return role.hasChannelsPermissions(); };
        var channel = await ChannelDao.findById(channelId);
        await this._checkUserRolePermissions(req, channel.organizationId, roleCheck);
    }

    async checkUserPermissions(req, organizationId){
        var roleCheck = (role) => { return role.hasUserPermissions(); };
        await this._checkUserRolePermissions(req, organizationId, roleCheck);
    }

    async checkBotPermissions(req){
        if (req.header('botToken') != Config.botToken){
            throw new UnauthorizedUserError();
        }
    }

}

module.exports = new RequestRolePermissions();