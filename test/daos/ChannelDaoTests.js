const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var ChannelDao = require('../../src/daos/ChannelDao');
var TitoBotService = require('../../src/services/TitoBotService');

var models = require('../../src/database/sequelize');
var Channel = models.channel;
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { UserNotFoundError, OrganizationNotFoundError, ChannelNotFoundError, UserAlreadyInChannelError, 
            UserNotBelongsToOrganizationError, UserNotBelongsToChannelError } = require('../../src/helpers/Errors');
var { channelCreateData } = require('../data/channelData');

describe('"ChannelDao Tests"', () => {
    var titoMock;

    var user;
    var organization;
    var channelData = Object.create(channelCreateData);

    before(async () => {
        titoMock = stub(TitoBotService, 'channelCreated').resolves();

        user = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user]);
        channelData.creatorToken = user.token;
        channelData.organizationId = organization.id;
    });

    after(async () => {
        titoMock.restore();
    });


    describe('Create channel', () => {
        var channel;

        beforeEach(async () => {
            titoMock.resetHistory();
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

        it('should inform tito', async () => {
            assert.calledOnce(titoMock);
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

        it('channel must not be created if user not belongs to organization', async () => {
            await organization.setUsers([]);
            await expect(ChannelDao.create(channelData)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
            await organization.addUser(user, {through: {role: 'role'}});
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

    describe('Delete', () => {
        var channel
        var organization;
        var user;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, organization);
            await ChannelDao.delete(channel.id);
        });

        it('channel must be deleted', async () => {
            var c = await Channel.findByPk(channel.id);
            expect(c).to.be.null;
        });

        it('delete again fails', async () => {
            await expect(ChannelDao.delete(channel.id)).to.eventually.be.rejectedWith(ChannelNotFoundError);
        });
    });
});
