var models = require('../database/sequelize');
var User = models.user;
var { UserNotFoundError } = require('../helpers/Errors');

class UserDao{

    async create(user){
        try {
            var existingUser = await this.findByToken(user.token);
            return existingUser;
        } catch (err){
            return await User.create(user);
        }
    }

    async findById(id){
        var user = await User.findByPk(id);
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

    async findByToken(token){
        var user = await User.findOne({where: {token: token}});
        if (!user) {
            throw new UserNotFoundError(token);
        }
        return user;
    }
    
    async update(user, token){
        await this.findByToken(token);
        await User.update(user, {where: {token: token}});
    }

    async usernameExists(username){
        var count = await User.count({where: {username: username}});
        return count > 0;
    }

    async findUserInvitations(token){
        var user = await this.findByToken(token);
        return await user.getOrganizationInvitations();
    }

}

module.exports = new UserDao();
