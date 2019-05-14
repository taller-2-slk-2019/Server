const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub } = require('sinon');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var OrganizationService = require('../../src/services/OrganizationService');
var FirebaseService = require('../../src/firebase/FirebaseService');

var models = require('../../src/database/sequelize');
var Organization = models.organization;
var Channel = models.channel;
var Conversation = models.conversation;
var MessageStatisticsDao = require('../../src/daos/MessageStatisticsDao');
var UserRoleDao = require('../../src/daos/UserRoleDao');
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { InvalidOrganizationInvitationTokenError, UserNotBelongsToOrganizationError,
            OrganizationNotFoundError } = require('../../src/helpers/Errors');

var CreatorRole = require('../../src/models/userRoles/UserRoleCreator');
var MemberRole = require('../../src/models/userRoles/UserRoleMember');
var organizationMessageCountMock = require('../mocks/messageCountByOrganizationMock');
var organizationUserCountMock = require('../mocks/userRolesCountByOrganizationMock');

describe('"OrganizationService Tests"', () => {
    var user;
    var creatorRole = new CreatorRole();
    var memberRole = new MemberRole();
    var firebaseMock;

    before(async () => {
        firebaseMock = stub(FirebaseService, 'sendOrganizationInvitationNotification').resolves();

        user = await TestDatabaseHelper.createUser();
    });

    after(async () => {
        firebaseMock.restore();
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
            users = await OrganizationService.findOrganizationUsers(organization.id);
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
            await OrganizationService.inviteUsers(organization.id, [userToInvite1.email, userToInvite2.email]);
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
            await OrganizationService.inviteUsers(organization.id, [userToInvite1.email]);
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(2);
        });

        it('inviting user again will return failed mail', async () => {
            var failed = await OrganizationService.inviteUsers(organization.id, [userToInvite1.email]);
            expect(failed[0]).to.eq(userToInvite1.email);
        });

        it('should invite user email only once', async () => {
            await organization.setInvitedUsers([]);
            await OrganizationService.inviteUsers(organization.id, [userToInvite1.email, userToInvite1.email])
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
            await OrganizationService.inviteUsers(organization.id, [userToInvite.email]);
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(0);
        });

        it('can not invite email that does not exist', async () => {
            await OrganizationService.inviteUsers(organization.id, ["fasdasd.does.not.exists@mail.not.exists.com"])
            var invited = await organization.getInvitedUsers();
            expect(invited.length).to.eq(0);
        });

        it('can not invite user to organization that does not exist', async () => {
            await expect(OrganizationService.inviteUsers(-2, [userToInvite.email]))
                .to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });
    });

    describe('Accept User Invitation', () => {
        var organization;
        var userToInvite;
        var token = "my-invitation-token-12345-to test invitations";

        before(async () => {
            organization = await TestDatabaseHelper.createOrganization();
            userToInvite = await TestDatabaseHelper.createUser("invited.user.to.organization@will.be.accepted.com");
        });

        beforeEach(async () => {
            await organization.setUsers([]);
            await organization.addInvitedUser(userToInvite, {through: {token: token}});
            await OrganizationService.acceptUserInvitation(token);
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
            await expect(OrganizationService.acceptUserInvitation("invalid-token"))
                .to.eventually.be.rejectedWith(InvalidOrganizationInvitationTokenError);
        });
    });

    describe('Remove user', () => {
        var organization;
        var usr;
        var channel, conversation, other_conversation;

        before(async () => {
            organization = await TestDatabaseHelper.createOrganization();;
            usr = await TestDatabaseHelper.createUser();
        });

        beforeEach(async () => {
            await organization.setUsers([]);
            await organization.addUser(usr, { through: {role:'role'}});
            channel = await TestDatabaseHelper.createChannel(usr, organization);
            var user2 = await TestDatabaseHelper.createUser();
            var user3 = await TestDatabaseHelper.createUser();
            conversation = await TestDatabaseHelper.createConversation(usr, user2, organization);
            other_conversation = await TestDatabaseHelper.createConversation(user3, user2, organization);

            await OrganizationService.removeUser(usr.id, organization.id);
        });

        it('organization must have 0 user', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(0);
        });

        it('can not remove user that does no belong to organization', async () => {
            await organization.setUsers([]);
            await expect(OrganizationService.removeUser(user.id, organization.id)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });

        it('user must be removed from organization channels', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(0);
        });

        it('user conversations must be deleted', async () => {
            var c = await Conversation.findByPk(conversation.id);
            expect(c).to.be.null;
        });

        it('other users conversations must not be deleted', async () => {
            var c = await Conversation.findByPk(other_conversation.id);
            expect(c).to.not.be.null;
        });
    });

    describe('Abandon user', () => {
        var organization;
        var usr;
        var channel, conversation, other_conversation;

        before(async () => {
            organization = await TestDatabaseHelper.createOrganization();;
            usr = await TestDatabaseHelper.createUser();
        });

        beforeEach(async () => {
            await organization.setUsers([]);
            await organization.addUser(usr, { through: {role:'role'}});
            channel = await TestDatabaseHelper.createChannel(usr, organization);
            var user2 = await TestDatabaseHelper.createUser();
            var user3 = await TestDatabaseHelper.createUser();
            conversation = await TestDatabaseHelper.createConversation(usr, user2, organization);
            other_conversation = await TestDatabaseHelper.createConversation(user3, user2, organization);

            await OrganizationService.abandonUser(usr.token, organization.id);
        });

        it('organization must have 0 user', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(0);
        });

        it('can not remove user that does no belong to organization', async () => {
            await organization.setUsers([]);
            await expect(OrganizationService.removeUser(user.id, organization.id)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });

        it('user must be removed from organization channels', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(0);
        });

        it('user conversations must be deleted', async () => {
            var c = await Conversation.findByPk(conversation.id);
            expect(c).to.be.null;
        });

        it('other users conversations must not be deleted', async () => {
            var c = await Conversation.findByPk(other_conversation.id);
            expect(c).to.not.be.null;
        });
    });

    describe('Get statistics', () => {
        var mock1, mock2;
        var stats;

        before(async () => {
            mock1 = stub(MessageStatisticsDao, 'getMessagesCountByOrganization').resolves(organizationMessageCountMock);
            mock2 = stub(UserRoleDao, 'getCountForOrganization').resolves(organizationUserCountMock);

            stats = await OrganizationService.getStatistics(1);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });

        it('stats must have user count', async () => {
            expect(stats).to.have.property('usersCount', organizationUserCountMock);
        });

        it('stats must have messages count', async () => {
            expect(stats).to.have.property('messagesCount', organizationMessageCountMock);
        });
    });
});