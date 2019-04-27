var models = require('../database/sequelize');
var AdminUser = models.adminUser;
var { AdminUserNotFoundError } = require('../helpers/Errors');

class AdminUserDao{

    async findByToken(token){
        var admin = await AdminUser.findOne({where: {token: token}});
        if (!admin) {
            throw new AdminUserNotFoundError(token);
        }
        return admin;
    }

    async login(username, password){
        var admin = await AdminUser.findOne(
            {
                where: {username: username,
                        password: password}
            }
        );

        if (!admin) {
            throw new AdminUserNotFoundError(username);
        }

        return admin;
    }

}

module.exports = new AdminUserDao();