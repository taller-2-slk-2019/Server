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
var { UserNotFoundError, OrganizationNotFoundError } = require('../../src/helpers/Errors');
var { channelCreateData } = require('../data/channelData');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"ChannelDao Tests"', () => {
    var user;
    var organization;
    var organizationData = Object.create(organizationCreateData);
    var channelData = Object.create(channelCreateData);

    before(async () => {
        user = await User.create(userCreateData);
        organizationData.creatorId = user.id;
        organization = await Organization.create(organizationData);
        channelData.creatorId = user.id;
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
            data.creatorId = -2;
            expect(ChannelDao.create(data)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('channel must not be created without organization', async () => {
            data.organizationId = -2;
            expect(ChannelDao.create(data)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('channel must not be created with empty data', async () => {
            expect(ChannelDao.create({})).to.eventually.be.rejectedWith(SequelizeValidationError);
        });
    });
});
