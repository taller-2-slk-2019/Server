var { forEach } = require('p-iteration');
var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.organization;
var { OrganizationNotFoundError } = require('../helpers/Errors');
var UserRoleCreator = require('../models/userRoles/UserRoleCreator');

class OrganizationDao{

    async create(organization){
        var user = await UserDao.findByToken(organization.creatorToken);

        var org = await Organization.create(organization);
        await org.addUser(user, { through: {role: (new UserRoleCreator()).name } });

        return org;
    }

    async update(organization, id){
        await this.findById(id);
        await Organization.update(organization, {where: {id: id}});
    }

    async findById(id){
        var org = await Organization.findByPk(id);
        if (!org){
            throw new OrganizationNotFoundError(id);
        }
        return org;
    }

    async get(){
        return await Organization.findAll();
    }

    async delete(organizationId){
        var organization = await this.findById(organizationId);
        var channels = await organization.getChannels();
        
        await forEach(channels, async (channel) => {
            await channel.destroy();
        });

        await organization.destroy();
    }

}

module.exports = new OrganizationDao();
