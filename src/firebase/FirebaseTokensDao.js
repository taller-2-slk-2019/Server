var models = require('../database/sequelize');
var User = models.user;

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
}

module.exports = new FirebaseTokensDao();