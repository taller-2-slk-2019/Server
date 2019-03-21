var models = require('../database/sequelize');
var User = models.User;
var { UserNotFoundError } = require('../helpers/Errors');

class UserDao{

    async create(user){
        return await User.create(user);
    }

    async findById(id){
        var user = await User.findByPk(id);
        if (!user) {
            throw new UserNotFoundError(id)
        }
        return user;
    }
    
    async update(user, id){
        var old_user = await this.findById(id);
        await User.update(user, {where: {id: id}});
    }

}

module.exports = new UserDao();
