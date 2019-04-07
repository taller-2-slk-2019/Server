const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var ConversationDao = require('../../src/daos/ConversationDao');

var models = require('../../src/database/sequelize');
var Conversation = models.conversation;
var User = models.user;
var Organization = models.organization;
var { ConversationNotFoundError } = require('../../src/helpers/Errors');
var { conversationCreateData } = require('../data/conversationData');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"ConversationDao Tests"', () => {
    var user;
    var organization;
    var organizationData = Object.create(organizationCreateData);
    var conversationData = Object.create(conversationCreateData);

    before(async () => {
        user = await User.create(userCreateData());
        organizationData.creatorId = user.id;
        organization = await Organization.create(organizationData);
        conversationData.organizationId = organization.id;
    });


    /*describe('Create channel', () => {
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
    });*/

    describe('Find by id', () => {
        var expected;
        var conversation;

        before(async () => {
            expected = await Conversation.create(conversationData);
            conversation = await ConversationDao.findById(expected.id);
        });

        it('conversation must not be null', async () => {
            expect(conversation).to.not.be.null;
        });
        
        it('conversation must have correct id', async () => {
            expect(conversation).to.have.property('id', expected.id);
        });

        it('throws exception if id does not exist', async () => {
            await expect(ConversationDao.findById(9999999)).to.eventually.be.rejectedWith(ConversationNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            await expect(ConversationDao.findById(0)).to.eventually.be.rejectedWith(ConversationNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            await expect(ConversationDao.findById(-1)).to.eventually.be.rejectedWith(ConversationNotFoundError);
        });

    });

    describe('Get conversations', () => {
        var conversation;
        var conversation2;
        var org;
        var usr;

        before(async () => {
            org = await Organization.create(organizationData);
            var data = Object.create(conversationData);
            data.organizationId = org.id;
            conversation = await Conversation.create(data);
            await conversation.addUser(user);
            conversation2 = await Conversation.create(data);
            await conversation2.addUser(user);
            usr = await User.create(userCreateData());
        });

        it('get for user and organization must return 2 conversations', async () => {
            var conversations = await ConversationDao.get(user.token, org.id);
            expect(conversations.length).to.eq(2);
        });

        it('get for other user and organization must return 0 channels', async () => {
            var conversations = await ConversationDao.get(usr.token, org.id);
            expect(conversations.length).to.eq(0);
        });

        it('user must belong to returned conversation', async () => {
            var conversations = await ConversationDao.get(user.token, org.id);
            var hasUser = await conversations[0].hasUser(user);
            expect(hasUser).to.be.true;
        });
    });

    describe('Find by users', () => {
        var conversation;
        var org;
        var usr;

        before(async () => {
            usr = await User.create(userCreateData());
            org = await Organization.create(organizationData);
            var data = Object.create(conversationData);
            data.organizationId = org.id;
            conversation = await Conversation.create(data);
            
            await conversation.addUser(user);
            await conversation.addUser(usr);
        });

        it('find by user1 and user2 must return conversation', async () => {
            var conversation = await ConversationDao.findByUsers(org, user, usr);
            expect(conversation).to.not.be.null;
        });

        it('find by user1 and user2 must return conversation with correct id', async () => {
            var conversation = await ConversationDao.findByUsers(org, user, usr);
            expect(conversation).to.have.property('id', conversation.id);
        });

        it('find by user1 and other user must return null', async () => {
            var usr2 = await User.create(userCreateData());
            var conversation = await ConversationDao.findByUsers(org, user, usr2);
            expect(conversation).to.be.null;
        });

    });
});
