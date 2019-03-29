const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var OrganizationDao = require('../../src/daos/OrganizationDao');

var models = require('../../src/database/sequelize');
var User = models.user;
var Organization = models.organization;
var Channel = models.channel;
var { UserNotFoundError, OrganizationNotFoundError, UserAlreadyInvitedError, UserAlreadyInOrganizationError,
            InvalidOrganizationInvitationTokenError, UserNotBelongsToOrganizationError } = require('../../src/helpers/Errors');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');
var { channelCreateData } = require('../data/channelData');
var CreatorRole = require('../../src/models/userRoles/UserRoleCreator');
var MemberRole = require('../../src/models/userRoles/UserRoleMember');

describe('"OrganizationDao Tests"', () => {
    var user;
    var organizationData = Object.create(organizationCreateData);
    var creatorRole = new CreatorRole();
    var memberRole = new MemberRole();

    before(async () => {
        user = await User.create(userCreateData);
        organizationData.creatorId = user.id;
    });

    describe('Create Organization', () => {
        var organization;

        beforeEach(async () => {
            organization = await OrganizationDao.create(organizationData);
        });

        it('organization must be created', async () => {
            expect(organization).to.not.be.null;
        });

        it('organization must have an id', async () => {
            expect(organization).to.have.property('id');
        });

        it('organization must have an user', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(1);
        });

        it('creator must belong to organization', async () => {
            var users = await organization.getUsers();
            expect(users[0].id).to.eq(user.id);
        });

        it('creator must have creator role', async () => {
            var users = await organization.getUsers();
            expect(users[0].userOrganizations.role).to.eq(creatorRole.name);
        });
    });

    describe('Create organization with errors', () => {
        var organization;
        var data;

        beforeEach(async () => {
            data = Object.create(organizationData);
        });

        it('organization must not be created without creator', async () => {
            data.creatorId = -2;
            await expect(OrganizationDao.create(data)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('organization must not be created with empty data', async () => {
            await expect(OrganizationDao.create({})).to.eventually.be.rejectedWith(SequelizeValidationError);
        });
    });

    describe('Find by id', () => {
        var expected;
        var organization;

        before(async () => {
            expected = await Organization.create(organizationData);
            organization = await OrganizationDao.findById(expected.id);
        });

        it('organization must not be null', async () => {
            expect(organization).to.not.be.null;
        });
        
        it('organization must have correct id', async () => {
            expect(organization).to.have.property('id', expected.id);
        });
        
        it('organization name must be correct', async () => {
            expect(organization).to.have.property('name', expected.name);
        });

        it('throws exception if id does not exist', async () => {
            await expect(OrganizationDao.findById(9999999)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            await expect(OrganizationDao.findById(0)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            await expect(OrganizationDao.findById(-1)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

    });

    describe('Invite User', () => {
        var organization;
        var invitedUserData = Object.create(userCreateData);
        var userToInvite;
        var token;

        before(async () => {
            organization = await Organization.create(organizationData);
            invitedUserData.email = "invited.user.to.organization@gmail.com";
            userToInvite = await User.create(invitedUserData);
        });

        beforeEach(async () => {
            await organization.setInvitedUsers([]);
            token = await OrganizationDao.inviteUser(organization.id, userToInvite.email);
        });

        it('token must not be null', async () => {
            expect(token).to.not.be.null;
        });
        
        it('organization must have one invited user', async () => {
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(1);
        });

        it('user must be invited', async () => {
            var invited = await organization.getInvitedUsers();
            expect(invited[0].id).to.eq(userToInvite.id);
        });

        it('user must not belong to organization', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(0);
        });

        it('can not invite user again', async () => {
            await expect(OrganizationDao.inviteUser(organization.id, userToInvite.email))
                .to.eventually.be.rejectedWith(UserAlreadyInvitedError);
        });
    });

    describe('Invite user with errors', () => {
        var organization;
        var invitedUserData = Object.create(userCreateData);
        var userToInvite;
        var token;

        before(async () => {
            organization = await Organization.create(organizationData);
            invitedUserData.email = "invited.user.to.organization2@gmail.com";
            userToInvite = await User.create(invitedUserData);
            await organization.addUser(userToInvite, { through: {role: creatorRole.name } });
        });

        it('can not invite user that already belongs to organization', async () => {
            await expect(OrganizationDao.inviteUser(organization.id, userToInvite.email))
                .to.eventually.be.rejectedWith(UserAlreadyInOrganizationError);
        });

        it('can not invite email that does not exist', async () => {
            await expect(OrganizationDao.inviteUser(organization.id, "fasdasd.does.not.exists@mail.not.exists.com"))
                .to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('can not invite user to organization that does not exist', async () => {
            await expect(OrganizationDao.inviteUser(-2, userToInvite.email))
                .to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });
    });

    describe('Accept User Invitation', () => {
        var organization;
        var invitedUserData = Object.create(userCreateData);
        var userToInvite;
        var token = "my-invitation-token-12345-to test invitations";

        before(async () => {
            organization = await Organization.create(organizationData);
            invitedUserData.email = "invited.user.to.organization@will.be.accepted.com";
            userToInvite = await User.create(invitedUserData);
        });

        beforeEach(async () => {
            await organization.setUsers([]);
            await organization.addInvitedUser(userToInvite, {through: {token: token}});
            await OrganizationDao.acceptUserInvitation(token);
        });
        
        it('organization has one user', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(1);
        });

        it('user belongs to organization', async () => {
            var users = await organization.getUsers();
            expect(users[0].id).to.eq(userToInvite.id);
        });

        it('user role is member', async () => {
            var users = await organization.getUsers();
            var role = users[0].userOrganizations.role;
            expect(role).to.eq(memberRole.name);
        });

        it('user is not in organization invited list', async () => {
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(0);
        });

        it('can not use invalid token', async () => {
            await expect(OrganizationDao.acceptUserInvitation("invalid-token"))
                .to.eventually.be.rejectedWith(InvalidOrganizationInvitationTokenError);
        });

    });

    describe('Remove user', () => {
        var organization;
        var usr;
        var channel;

        before(async () => {
            organization = await Organization.create(organizationData);
            usr = await User.create(userCreateData);
        });

        beforeEach(async () => {
            await organization.setUsers([]);
            await organization.addUser(usr, { through: {role:'role'}});
            var channelData = Object.create(channelCreateData);
            channelData.creatorId = usr.id;
            channelData.organizationId = organization.id;
            channel = await Channel.create(channelData);
            await channel.setUsers([usr]);

            await OrganizationDao.removeUser(usr.id, organization.id);
        });

        it('organization must have 0 user', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(0);
        });

        it('can not remove user that does no belong to organization', async () => {
            await organization.setUsers([]);
            await expect(OrganizationDao.removeUser(user.id, organization.id)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });

        it('user must be removed from organization channels', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(0);
        });
    });

    describe('Find for user', () => {
        var organization1;
        var organization2;
        var user;
        var organizations;

        before(async () => {
            organization1 = await Organization.create(organizationData);
            user = await User.create(userCreateData);
            await organization1.addUser(user, {through: {role:'role'}});
            organization2 = await Organization.create(organizationData);
            await organization2.addUser(user, {through: {role:'role'}});
            
            organizations = await OrganizationDao.findForUser(user.id);
        });

        it('must return 2 organizations', async () => {
            expect(organizations.length).to.eq(2);
        });
        
        it('organizations must have correct id', async () => {
            expect(organizations[0]).to.have.property('id', organization1.id);
        });

        it('organization must have user', async () => {
            var belongs = await organizations[0].hasUser(user);
            expect(belongs).to.be.true;
        });
    });

    describe('Find Organization Users', () => {
        var organization;
        var user;
        var user2;
        var users;

        before(async () => {
            organization = await Organization.create(organizationData);
            user = await User.create(userCreateData);
            user2 = await User.create(userCreateData);
            await organization.addUser(user, {through: {role:'role'}});
            await organization.addUser(user2, {through: {role:'role'}});
            
            users = await OrganizationDao.findOrganizationUsers(organization.id);
        });

        it('must return 2 users', async () => {
            expect(users.length).to.eq(2);
        });
        
        it('users must have correct id', async () => {
            expect(users[0]).to.have.property('id', user.id);
        });

        it('users must belong to organization', async () => {
            var belongs = await users[0].hasOrganization(organization);
            expect(belongs).to.be.true;
        });
    });

});
