var sha1 = require('sha1');
var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.Organization;
var { UserAlreadyInvitedError, UserAlreadyInOrganizationError, UserNotFoundError } = require('../helpers/Errors');

class OrganizationDao{

    async create(organization){
        var user = await UserDao.findById(organization.creatorId);

        if (!user){
            throw new UserNotFoundError(organization.creatorId);
        }

        var org = await Organization.create(organization);
        await org.addUser(user, { through: {role: 'creator' } }); //TODO change this to a constant in role class

        return org;
    }

    async findById(id){
        return await Organization.findByPk(id, 
            { include : [models.User, models.Channel] });
    }

    async inviteUser(organizationId, userId){
        var organization = await this.findById(organizationId);

        var existingUser = (await organization.getUsers()).find((usr) => usr.id == userId);
        if (existingUser){
            throw new UserAlreadyInOrganizationError(organization.id, userId);
        }

        var invitedUser = (await organization.getInvitedUsers()).find((usr) => usr.id == userId);
        if (invitedUser){
            throw new UserAlreadyInvitedError(organization.id, userId);
        }

        var user = await UserDao.findById(userId);
        if (!user){
            throw new UserNotFoundError(userId);
        }

        var token = sha1(Date.now());
        await organization.addInvitedUser(user, { through: {token: token } });
        return token;
    }

}

module.exports = new OrganizationDao();