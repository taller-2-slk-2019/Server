const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var ChannelDao = require('../../src/daos/ChannelDao');

var models = require('../../src/database/sequelize');
var Channel = models.channel;
var User = models.user;
var Organization = models.organization;
var { UserNotFoundError, OrganizationNotFoundError, ChannelNotFoundError, UserAlreadyInChannelError, 
            UserNotBelongsToOrganizationError, UserNotBelongsToChannelError } = require('../../src/helpers/Errors');
var { channelCreateData } = require('../data/channelData');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"ChannelDao Tests"', () => {
    var user;
    var organization;
    var organizationData = Object.create(organizationCreateData);
    var channelData = Object.create(channelCreateData);

    before(async () => {
        user = await User.create(userCreateData());
        organizationData.creatorId = user.id;
        organization = await Organization.create(organizationData);
        channelData.creatorToken = user.token;
        channelData.organizationId = organization.id;
    });


    describe('Create channel', () => {
        var channel;

        beforeEach(async () => {
            channel = await ChannelDao.create(channelData);
        });

        it('channel must be created', async () => {
            expect(channel).to.not.be.null;
        });

        it('channel must have an id', async () => {
            expect(channel).to.have.property('id');
        });

        it('channel organization must be correct', async () => {
            var org = await channel.getOrganization();
            expect(org.id).to.eq(organization.id);
        });

        it('channel creator must be ok', async () => {
            var creator = await channel.getCreator();
            expect(creator.id).to.eq(user.id);
        });

        it('channel must have an user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(1);
        });

        it('creator must belong to channel', async () => {
            var users = await channel.getUsers();
            expect(users[0].id).to.eq(user.id);
        });
    });

    describe('Create channel with error', () => {
        var channel;
        var data;

        beforeEach(async () => {
            data = Object.create(channelData);
        });

        it('channel must not be created without creator', async () => {
            data.creatorToken = "abc";
           await  expect(ChannelDao.create(data)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('channel must not be created without organization', async () => {
            data.organizationId = -2;
            data.creatorToken = user.token;
            await expect(ChannelDao.create(data)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('channel must not be created with empty data', async () => {
            await expect(ChannelDao.create({})).to.eventually.be.rejectedWith(SequelizeValidationError);
        });
    });

    describe('Find by id', () => {
        var expected;
        var channel;

        before(async () => {
            expected = await Channel.create(channelData);
            channel = await ChannelDao.findById(expected.id);
        });

        it('channel must not be null', async () => {
            expect(channel).to.not.be.null;
        });
        
        it('channel must have correct id', async () => {
            expect(channel).to.have.property('id', expected.id);
        });
        
        it('channel name must be correct', async () => {
            expect(channel).to.have.property('name', expected.name);
        });

        it('throws exception if id does not exist', async () => {
            await expect(ChannelDao.findById(9999999)).to.eventually.be.rejectedWith(ChannelNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            await expect(ChannelDao.findById(0)).to.eventually.be.rejectedWith(ChannelNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            await expect(ChannelDao.findById(-1)).to.eventually.be.rejectedWith(ChannelNotFoundError);
        });

    });

    describe('Add user', () => {
        var channel;
        var usr;

        before(async () => {
            channel = await Channel.create(channelData);
            usr = await User.create(userCreateData());
            await organization.addUser(usr, { through: {role: 'role'}});
        });

        beforeEach(async () => {
            await channel.setUsers([]);
            await ChannelDao.addUser(channel.id, usr.id);
        });

        it('channel must have 1 user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(1);
        });

        it('user must be added to channel', async () => {
            var users = await channel.getUsers();
            expect(users[0].id).to.eq(usr.id);
        });

        it('can not add user again to channel', async () => {
            await expect(ChannelDao.addUser(channel.id, usr.id)).to.eventually.be.rejectedWith(UserAlreadyInChannelError);
        });

        it('can not add user that does not belong to channel organization', async () => {
            var user2 = await User.create(userCreateData());
            await expect(ChannelDao.addUser(channel.id, user2.id)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });

    });

    describe('Remove user', () => {
        var channel;
        var usr;

        before(async () => {
            channel = await Channel.create(channelData);
            usr = await User.create(userCreateData());
        });

        beforeEach(async () => {
            await channel.setUsers([usr]);
            await ChannelDao.removeUser(usr.id, channel.id);
        });

        it('channel must have 0 user', async () => {
            var users = await channel.getUsers();
            expect(users.length).to.eq(0);
        });

        it('can not remove user that does no belong to channel', async () => {
            await channel.setUsers([]);
            await expect(ChannelDao.removeUser(user.id, channel.id)).to.eventually.be.rejectedWith(UserNotBelongsToChannelError);
        });
    });

    describe('Get channels', () => {
        var channel;
        var channel2;
        var org;
        var usr;

        before(async () => {
            org = await Organization.create(organizationData);
            var data = Object.create(channelData);
            data.organizationId = org.id;
            channel = await Channel.create(data);
            await channel.addUser(user);
            channel2 = await Channel.create(data);
            await channel2.addUser(user);
            usr = await User.create(userCreateData());
        });

        it('get for user and organization must return 2 channels', async () => {
            var channels = await ChannelDao.get(user.token, org.id);
            expect(channels.length).to.eq(2);
        });

        it('get for other user and organization must return 0 channels', async () => {
            var channels = await ChannelDao.get(usr.token, org.id);
            expect(channels.length).to.eq(0);
        });

        it('user must belong to returned channels', async () => {
            var channels = await ChannelDao.get(user.token, org.id);
            var hasUser = await channels[0].hasUser(user);
            expect(hasUser).to.be.true;
        });

    });
});
