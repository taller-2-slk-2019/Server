const MessageDao = require('../daos/MessageDao');
const UserDao = require('../daos/UserDao');
const UserStatistics = require('../models/statistics/UserStatistics');

class UserService {
    async getStatistics(userToken) {
        return UserDao.findByToken(userToken)
            .then(user => {
                return Promise.all([
                    user.getOrganizations().map(org => org.name),
                    MessageDao.getMessagesCountByUser(user.id),
                ]).then(results =>  new UserStatistics(results[0], results[1]));
            });
    }
}

module.exports = new UserService();