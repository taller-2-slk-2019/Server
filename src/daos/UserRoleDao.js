var models = require('../database/sequelize');
var UserRole = models.userOrganizations;

class UserRoleDao{

    async getCountForOrganization(organizationId){
        return await UserRole.count({
            attributes: ['role'],
            where: {
                organizationId: organizationId
            },
            group: ['role']
        });
    }

}

module.exports = new UserRoleDao();