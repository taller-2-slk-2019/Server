var models = require('../database/sequelize');
var User = models.user;
var FirebaseToken = models.firebaseToken;
var UserDao = require('../daos/UserDao');

class FirebaseTokensDao {

    async getForUsers(usernames){
        var users = await User.findAll({
            include: [{ association: User.firebaseTokens }],
            where: {
                username: usernames
            }
        });

        var tokens = [];
        users.forEach(user => {
            tokens = tokens.concat(user.firebaseTokens.map(token => {
                return token.token;
            }));
        });

        return tokens;
    }

    async addToken(userToken, token){
        var user = await UserDao.findByToken(userToken);

        var data = {
            userId: user.id,
            token: token
        };

        await FirebaseToken.create(data);
    }

    async removeToken(token){
        await FirebaseToken.destroy({
            where: {token: token}
        });
    }
}

module.exports = new FirebaseTokensDao();