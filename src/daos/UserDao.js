var models = require('../database/sequelize');
var User = models.user;
var Organization = models.organization;
var { UserNotFoundError } = require('../helpers/Errors');

class UserDao{

    async create(user){
        return await User.create(user);
    }

    async findById(id){
        var user = await User.findByPk(id);
        if (!user) {
            throw new UserNotFoundError(id);
        }
        return user;
    }

    async findWithOrganizations(id){
        var user = await User.findByPk(id, { include : Organization });
        if (!user) {
            throw new UserNotFoundError(id);
        }
        return user;
    }

    async findByEmail(email){
        var user = await User.findOne({where: {email: email}});
        if (!user) {
            throw new UserNotFoundError(email);
        }
        return user;
    }
    
    async update(user, id){
        await this.findById(id);
        await User.update(user, {where: {id: id}});
    }

}

module.exports = new UserDao();
