var models = require('../database/sequelize');
var User = models.User;

class UserDao{

    async create(user){
        if (!user.picture){
            user.picture = 'default.jpg';
        }

        return await User.create(user);
    }

}

module.exports = new UserDao();