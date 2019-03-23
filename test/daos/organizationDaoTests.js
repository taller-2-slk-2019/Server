const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var OrganizationDao = require('../../src/daos/OrganizationDao');

var models = require('../../src/database/sequelize');
var User = models.user;
var Organization = models.organization;
var { UserNotFoundError, OrganizationNotFoundError, UserAlreadyInvitedError, UserAlreadyInOrganizationError,
            InvalidOrganizationInvitationTokenError } = require('../../src/helpers/Errors');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');
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
            expect(OrganizationDao.create(data)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('organization must not be created with empty data', async () => {
            expect(OrganizationDao.create({})).to.eventually.be.rejectedWith(SequelizeValidationError);
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
            expect(OrganizationDao.findById(9999999)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            expect(OrganizationDao.findById(0)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            expect(OrganizationDao.findById(-1)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
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
            expect(OrganizationDao.inviteUser(organization.id, userToInvite.email))
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
            expect(OrganizationDao.inviteUser(organization.id, userToInvite.email))
                .to.eventually.be.rejectedWith(UserAlreadyInOrganizationError);
        });

        it('can not invite email that does not exist', async () => {
            expect(OrganizationDao.inviteUser(organization.id, "fasdasd.does.not.exists@mail.not.exists.com"))
                .to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('can not invite user to organization that does not exist', async () => {
            expect(OrganizationDao.inviteUser(-2, userToInvite.email))
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
            expect(OrganizationDao.acceptUserInvitation("invalid-token"))
                .to.eventually.be.rejectedWith(InvalidOrganizationInvitationTokenError);
        });

    });

});
