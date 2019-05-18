const MessageStatisticsDao = require('../daos/MessageStatisticsDao');
const UserDao = require('../daos/UserDao');
const UserStatistics = require('../models/statistics/UserStatistics');
var models = require('../database/sequelize');
var OrganizationUserInvitation = models.organizationUserInvitation;

class UserService {

    async getStatistics(userToken) {
        var user = await UserDao.findByToken(userToken);
        return await this._getStatistics(user);
    }

    async getUserStatistics(userId) {
        var user = await UserDao.findById(userId);
        return await this._getStatistics(user);
    }

    async findUserOrganizations(userToken){
        var user = await UserDao.findByToken(userToken);
        return await user.getOrganizations();
    }

    async findUserInvitations(token){
        var user = await UserDao.findByToken(token);
        return await user.getOrganizationInvitations();
    }

    async deleteUserInvitation(token){
        await OrganizationUserInvitation.destroy(
            {
                where: {token: token},
            });
    }

    async _getStatistics(user){
        var [orgs, messageCount] = await Promise.all([
                          user.getOrganizations().map(org => org.name),
                          MessageStatisticsDao.getMessagesCountByUser(user.id),
                        ]);
        return new UserStatistics(orgs, messageCount);
    }
}

module.exports = new UserService();