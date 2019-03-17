var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.Organization;

class OrganizationDao{

    async create(organization){
        var user = await UserDao.findById(organization.creatorId);

        if (!user){
            throw new Error("Creator doesn't exist");
        }

        var org = await Organization.create(organization);
        await org.addUser(user, { through: {role: 'creator' } }); //TODO change this to a constant in role class

        return org;
    }

}

module.exports = new OrganizationDao();