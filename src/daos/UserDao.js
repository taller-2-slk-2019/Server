var models = require('../database/sequelize');
var User = models.User;

class UserDao{

    async create(user){
        return await User.create(user);
    }

    async findById(id){
        return await User.findByPk(id);
    }

}

module.exports = new UserDao();