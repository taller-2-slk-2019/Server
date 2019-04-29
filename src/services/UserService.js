const MessageStatisticsDao = require('../daos/MessageStatisticsDao');
const UserDao = require('../daos/UserDao');
const UserStatistics = require('../models/statistics/UserStatistics');
var models = require('../database/sequelize');
var OrganizationUserInvitation = models.organizationUserInvitation;

class UserService {

    async getStatistics(userToken) {
        var user = await UserDao.findByToken(userToken);

        var [orgs, messageCount] = await Promise.all([
                          user.getOrganizations().map(org => org.name),
                          MessageStatisticsDao.getMessagesCountByUser(user.id),
                        ]);
        return new UserStatistics(orgs, messageCount);
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
}

module.exports = new UserService();