const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var OrganizationDao = require('../../src/daos/OrganizationDao');
var FirebaseController = require('../../src/firebase/FirebaseController');

var models = require('../../src/database/sequelize');
var Organization = models.organization;
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { UserNotFoundError, OrganizationNotFoundError,
            InvalidOrganizationInvitationTokenError, UserNotBelongsToOrganizationError } = require('../../src/helpers/Errors');
var { organizationCreateData } = require('../data/organizationData');

var CreatorRole = require('../../src/models/userRoles/UserRoleCreator');
var MemberRole = require('../../src/models/userRoles/UserRoleMember');

describe('"OrganizationDao Tests"', () => {
    var user;
    var organizationData = Object.create(organizationCreateData);
    var creatorRole = new CreatorRole();
    var memberRole = new MemberRole();
    var firebaseMock;

    before(async () => {
        firebaseMock = stub(FirebaseController, 'sendOrganizationInvitationNotification').resolves();

        user = await TestDatabaseHelper.createUser();
        organizationData.creatorToken = user.token;
    });

    after(async () => {
        firebaseMock.restore();
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
            data.creatorToken = "abc";
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
            expected = await TestDatabaseHelper.createOrganization();
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

    describe('Invite Users', () => {
        var organization;
        var userToInvite1;
        var userToInvite2;

        before(async () => {
            organization = await TestDatabaseHelper.createOrganization();
            userToInvite1 = await TestDatabaseHelper.createUser("invited.user.to.organization-1@gmail.com");
            userToInvite2 = await TestDatabaseHelper.createUser("invited.user.to.organization-2@gmail.com");
        });

        beforeEach(async () => {
            await organization.setInvitedUsers([]);
            await OrganizationDao.inviteUsers(organization.id, [userToInvite1.email, userToInvite2.email]);
        });
        
        it('organization must have two invited user', async () => {
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(2);
        });

        it('users must be invited', async () => {
            var invited = await organization.getInvitedUsers();
            expect(invited[0].id).to.be.oneOf([userToInvite1.id, userToInvite2.id]);
        });

        it('user must not belong to organization', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(0);
        });

        it('inviting user again will not fail', async () => {
            await OrganizationDao.inviteUsers(organization.id, [userToInvite1.email]);
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(2);
        });

        it('inviting user again will return failed mail', async () => {
            var failed = await OrganizationDao.inviteUsers(organization.id, [userToInvite1.email]);
            expect(failed[0]).to.eq(userToInvite1.email);
        });

        it('should invite user email only once', async () => {
            await organization.setInvitedUsers([]);
            await OrganizationDao.inviteUsers(organization.id, [userToInvite1.email, userToInvite1.email])
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(1);
        });
    });

    describe('Invite users with errors', () => {
        var organization;
        var userToInvite;

        before(async () => {
            organization = await TestDatabaseHelper.createOrganization();
            userToInvite = await TestDatabaseHelper.createUser("invited.user.to.organization3@gmail.com");
            await organization.addUser(userToInvite, { through: {role: creatorRole.name } });
        });

        it('can not invite user that already belongs to organization', async () => {
            await OrganizationDao.inviteUsers(organization.id, [userToInvite.email]);
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(0);
        });

        it('can not invite email that does not exist', async () => {
            await OrganizationDao.inviteUsers(organization.id, ["fasdasd.does.not.exists@mail.not.exists.com"])
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(0);
        });

        it('can not invite user to organization that does not exist', async () => {
            await expect(OrganizationDao.inviteUsers(-2, [userToInvite.email]))
                .to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });
    });

    describe('Accept User Invitation', () => {
        var organization;
        var userToInvite;
        var token = "my-invitation-token-12345-to test invitations";

        before(async () => {
            organization = await Organization.create(organizationData);
            userToInvite = await TestDatabaseHelper.createUser("invited.user.to.organization@will.be.accepted.com");
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
            organization = await TestDatabaseHelper.createOrganization();;
            usr = await TestDatabaseHelper.createUser();
        });

        beforeEach(async () => {
            await organization.setUsers([]);
            await organization.addUser(usr, { through: {role:'role'}});
            channel = await TestDatabaseHelper.createChannel(usr, organization);

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
            user = await TestDatabaseHelper.createUser();
            organization1 = await TestDatabaseHelper.createOrganization([user]);
            organization2 = await TestDatabaseHelper.createOrganization([user]);
            
            organizations = await OrganizationDao.findForUser(user.token);
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
            user = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user, user2]);
            users = await OrganizationDao.findOrganizationUsers(organization.id);
        });

        it('must return 2 users', async () => {
            expect(users.length).to.eq(2);
        });
        
        it('users must have correct id', async () => {
            expect([user.id, user2.id]).to.include(users[0].id);
        });

        it('users must belong to organization', async () => {
            var belongs = await users[0].hasOrganization(organization);
            expect(belongs).to.be.true;
        });
    });

});
