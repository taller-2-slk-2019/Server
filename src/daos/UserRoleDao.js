var models = require('../database/sequelize');
var UserRole = models.userOrganizations;

class UserRoleDao {

    async updateUserRole(organizationId, userId, role){
        await UserRole.update(
            { role: role },
            { where: 
                { 
                    organizationId: organizationId,
                    userId: userId
                }
            }
        );
    }

    async getUserRole(organizationId, userId){
        var data = await UserRole.findOne(
            { where: 
                { 
                    organizationId: organizationId,
                    userId: userId
                }
            }
        );

        return data.role;
    }

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