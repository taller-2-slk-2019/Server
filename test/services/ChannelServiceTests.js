const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var ChannelService = require('../../src/services/ChannelService');
var MessageStatisticsDao = require('../../src/daos/MessageStatisticsDao');
var TitoBotService = require('../../src/services/TitoBotService');
var FirebaseService = require('../../src/firebase/FirebaseService');

var models = require('../../src/database/sequelize');
var Channel = models.channel;
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { UserNotFoundError, OrganizationNotFoundError, ChannelNotFoundError, UserAlreadyInChannelError, 
            UserNotBelongsToOrganizationError, UserNotBelongsToChannelError, UnauthorizedUserError } = require('../../src/helpers/Errors');

describe('"ChannelService Tests"', () => {
    var titoMock;
    var firebaseMock;

    var user;
    var organization;

    before(async () => {
        titoMock = stub(TitoBotService, 'userAddedToChannel').resolves();
        firebaseMock = stub(FirebaseService, 'sendChannelInvitationNotification').resolves();

        user = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user]);
    });

    after(async () => {
        titoMock.restore();
        firebaseMock.restore();
    });

    describe('Find Channel Users', () => {
        var channel
        var organization;
        var user;
        var user2;
        var users;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user, user2]);
            channel = await TestDatabaseHelper.createChannel(user, organization);
            await channel.addUser(user2);
            users = await ChannelService.getChannelUsers(channel.id);
        });

        it('must return 2 users', async () => {
            expect(users.length).to.eq(2);
        });
        
        it('users must have correct id', async () => {
            expect([user.id, user2.id]).to.include(users[0].id);
        });

        it('users must belong to channel', async () => {
            var belongs = await channel.hasUser(users[0]);
            expect(belongs).to.be.true;
        });
    });

    describe('Add user', () => {
        var channel;
        var usr;

        before(async () => {
            channel = await TestDatabaseHelper.createChannel(user, organization);
            usr = await TestDatabaseHelper.createUser();
            await organization.addUser(usr, { through: {role: 'role'}});
        });

        beforeEach(async () => {
            titoMock.resetHistory();
            firebaseMock.resetHistory();
            await channel.setUsers([]);
            await ChannelService.addUser(channel.id, usr.id);
        });

        it('channel must have 1 user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(1);
        });

        it('user must be added to channel', async () => {
            var users = await channel.getUsers();
            expect(users[0].id).to.eq(usr.id);
        });

        it('should inform tito', async () => {
            assert.calledOnce(titoMock);
        });

        it('should inform firebase', async () => {
            assert.calledOnce(firebaseMock);
        });

        it('can not add user again to channel', async () => {
            await expect(ChannelService.addUser(channel.id, usr.id)).to.eventually.be.rejectedWith(UserAlreadyInChannelError);
        });

        it('can not add user that does not belong to channel organization', async () => {
            var user2 = await TestDatabaseHelper.createUser();
            await expect(ChannelService.addUser(channel.id, user2.id)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });
    });

    describe('Join user', () => {
        var channel;
        var usr;

        before(async () => {
            channel = await TestDatabaseHelper.createChannel(user, organization);
            usr = await TestDatabaseHelper.createUser();
            await organization.addUser(usr, { through: {role: 'role'}});
        });

        beforeEach(async () => {
            titoMock.resetHistory();
            firebaseMock.resetHistory();
            await channel.setUsers([]);
            await ChannelService.joinUser(channel.id, usr.token);
        });

        it('channel must have 1 user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(1);
        });

        it('user must be added to channel', async () => {
            var users = await channel.getUsers();
            expect(users[0].id).to.eq(usr.id);
        });

        it('should inform tito', async () => {
            assert.calledOnce(titoMock);
        });

        it('should not inform firebase', async () => {
            assert.notCalled(firebaseMock);
        });

        it('can not add user again to channel', async () => {
            await expect(ChannelService.joinUser(channel.id, usr.token)).to.eventually.be.rejectedWith(UserAlreadyInChannelError);
        });

        it('can not add user that does not belong to channel organization', async () => {
            var user2 = await TestDatabaseHelper.createUser();
            await expect(ChannelService.joinUser(channel.id, user2.token)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });

        it('can not add user to private channel', async () => {
            private = await TestDatabaseHelper.createChannel(user, organization, false);
            await expect(ChannelService.joinUser(private.id, usr.token)).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });
    });

    describe('Add username', () => {
        var channel;
        var usr;

        before(async () => {
            channel = await TestDatabaseHelper.createChannel(user, organization);
            usr = await TestDatabaseHelper.createUser();
            await organization.addUser(usr, { through: {role: 'role'}});
        });

        beforeEach(async () => {
            titoMock.resetHistory();
            firebaseMock.resetHistory();
            await channel.setUsers([]);
            await ChannelService.addUsername(channel.id, usr.username);
        });

        it('channel must have 1 user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(1);
        });

        it('user must be added to channel', async () => {
            var users = await channel.getUsers();
            expect(users[0].id).to.eq(usr.id);
        });

        it('should inform tito', async () => {
            assert.calledOnce(titoMock);
        });

        it('should inform firebase', async () => {
            assert.calledOnce(firebaseMock);
        });

        it('can not add user again to channel', async () => {
            await expect(ChannelService.addUsername(channel.id, usr.username)).to.eventually.be.rejectedWith(UserAlreadyInChannelError);
        });

        it('can not add user that does not belong to channel organization', async () => {
            var user2 = await TestDatabaseHelper.createUser();
            await expect(ChannelService.addUsername(channel.id, user2.username)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });
    });

    describe('Remove user', () => {
        var channel;
        var usr;

        before(async () => {
            channel = await TestDatabaseHelper.createChannel(user, organization);
            usr = await TestDatabaseHelper.createUser();
        });

        beforeEach(async () => {
            await channel.setUsers([usr]);
            await ChannelService.removeUser(usr.id, channel.id);
        });

        it('channel must have 0 user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(0);
        });

        it('can not remove user that does no belong to channel', async () => {
            await channel.setUsers([]);
            await expect(ChannelService.removeUser(user.id, channel.id)).to.eventually.be.rejectedWith(UserNotBelongsToChannelError);
        });
    });

    describe('Abandon user', () => {
        var channel;
        var usr;

        before(async () => {
            channel = await TestDatabaseHelper.createChannel(user, organization);
            usr = await TestDatabaseHelper.createUser();
        });

        beforeEach(async () => {
            await channel.setUsers([usr]);
            await ChannelService.abandonUser(usr.token, channel.id);
        });

        it('channel must have 0 user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(0);
        });

        it('can not remove user that does no belong to channel', async () => {
            await channel.setUsers([]);
            await expect(ChannelService.abandonUser(user.token, channel.id)).to.eventually.be.rejectedWith(UserNotBelongsToChannelError);
        });
    });

    describe('Get channels for user', () => {
        var channel;
        var channel2;
        var org;
        var usr;

        before(async () => {
            org = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, org);
            channel2 = await TestDatabaseHelper.createChannel(user, org);
            usr = await TestDatabaseHelper.createUser();
        });

        it('get for user and organization must return 2 channels', async () => {
            var channels = await ChannelService.getForUser(org.id, user.token, true);
            expect(channels.length).to.eq(2);
        });

        it('get for other user and organization must return 0 channels', async () => {
            var channels = await ChannelService.getForUser(org.id, usr.token, true);
            expect(channels.length).to.eq(0);
        });

        it('user must belong to returned channels', async () => {
            var channels = await ChannelService.getForUser(org.id, user.token, true);
            var hasUser = await channels[0].hasUser(user);
            expect(hasUser).to.be.true;
        });
    });

    describe('Get channels that user not belongs to', () => {
        var channel;
        var channel2;
        var org;
        var usr;

        before(async () => {
            org = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, org);
            channel2 = await TestDatabaseHelper.createChannel(user, org, false);
            usr = await TestDatabaseHelper.createUser();
        });

        it('get for user and organization must return 1 channel', async () => {
            var channels = await ChannelService.getForUser(org.id, usr.token, false);
            expect(channels.length).to.eq(1);
        });

        it('get for other user and organization must return 0 channels', async () => {
            var channels = await ChannelService.getForUser(org.id, user.token, false);
            expect(channels.length).to.eq(0);
        });

        it('user must belong to returned channels', async () => {
            var channels = await ChannelService.getForUser(org.id, usr.token, false);
            var hasUser = await channels[0].hasUser(usr);
            expect(hasUser).to.be.false;
        });
    });

    describe('Get channels', () => {
        var channel;
        var channel2;
        var org;
        var usr;

        before(async () => {
            org = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, org);
            channel2 = await TestDatabaseHelper.createChannel(user, org);
            usr = await TestDatabaseHelper.createUser();
        });

        it('get for user and organization must return 2 channels', async () => {
            var channels = await ChannelService.get(org.id);
            var orgChannels = await org.getChannels();
            expect(channels.length).to.eq(orgChannels.length);
        });
    });

    describe('Get statistics', () => {
        var channel
        var stats;
        var mock;

        before(async () => {
            mock = stub(MessageStatisticsDao, 'getMessagesCountByChannel').returns(10);
            channel = await TestDatabaseHelper.createChannel(user, organization);
            stats = await ChannelService.getStatistics(channel.id);
        });

        after(async () => {
            mock.restore();
        });

        it('message count must be 10', async () => {
            expect(stats.messageCount).to.eq(10);
        });
    });
   
});
