var Token = require('../helpers/Token');
var logger = require('logops');
var UserDao = require('./UserDao');
var models = require('../database/sequelize');
var Organization = models.organization;
var OrganizationUserInvitation = models.organizationUserInvitation;
var { UserAlreadyInvitedError, UserAlreadyInOrganizationError,
             InvalidOrganizationInvitationTokenError, OrganizationNotFoundError} = require('../helpers/Errors');
var UserRoleCreator = require('../models/userRoles/UserRoleCreator');
var UserRoleMember = require('../models/userRoles/UserRoleMember');

class OrganizationDao{

    async create(organization){
        var user = await UserDao.findById(organization.creatorId);

        var org = await Organization.create(organization);
        await org.addUser(user, { through: {role: (new UserRoleCreator()).name } });

        return org;
    }

    async findById(id){
        var org = await Organization.findByPk(id, 
            { include : [models.user, models.channel] });
        if (!org){
            throw new OrganizationNotFoundError(id);
        }
        return org;
    }

    async inviteUser(organizationId, userEmail){
        var organization = await this.findById(organizationId);

        var user = await UserDao.findByEmail(userEmail); 

        var existingUser = await organization.hasUser(user);
        if (existingUser){
            throw new UserAlreadyInOrganizationError(organization.id, user.id);
        }

        var invitedUser = await organization.hasInvitedUser(user);
        if (invitedUser){
            throw new UserAlreadyInvitedError(organization.id, user.id);
        }

        var token = Token.generate();
        await organization.addInvitedUser(user, { through: {token: token } });
        return token;
    }

    async acceptUserInvitation(token){
        var invitation = await OrganizationUserInvitation.findOne(
            {
                where: {token: token},
            });

        if (!invitation){
            throw new InvalidOrganizationInvitationTokenError(token);
        }

        var org = await this.findById(invitation.organizationId);
        var user = await UserDao.findById(invitation.userId);

        await org.addUser(user, { through: {role: (new UserRoleMember()).name } });
        await invitation.destroy();

        logger.info(`User ${user.id} accepted invitation to organization ${org.id}`);
    }


}

module.exports = new OrganizationDao();