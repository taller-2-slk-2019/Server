const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var ConversationDao = require('../../src/daos/ConversationDao');

var models = require('../../src/database/sequelize');
var Conversation = models.conversation;
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { ConversationNotFoundError, UserNotBelongsToOrganizationError, InvalidConversationError } = require('../../src/helpers/Errors');
var { conversationCreateData } = require('../data/conversationData');

describe('"ConversationDao Tests"', () => {
    var user;
    var user2;
    var organization;
    var conversationData = Object.create(conversationCreateData);

    before(async () => {
        user = await TestDatabaseHelper.createUser();
        user2 = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user, user2]);
        conversationData.organizationId = organization.id;
    });


    describe('Create conversation', () => {
        var conversation;

        before(async () => {
            conversation = await ConversationDao.create(organization.id, user2.id, user.token);
        });

        it('conversation must be created', async () => {
            expect(conversation).to.not.be.null;
        });

        it('conversation must have an id', async () => {
            expect(conversation).to.have.property('id');
        });

        it('conversation organization must be correct', async () => {
            var org = await conversation.getOrganization();
            expect(org.id).to.eq(organization.id);
        });

        it('conversation must have two users', async () => {
            var users = conversation.users;
            expect(users.length).to.eq(1);
        });

        it('conversation must have non creator user', async () => {
            var users = conversation.users;
            expect(users[0].id).to.eq(user2.id);
        });

        it('conversation for same users must return the same', async () => {
            var conversation2 = await ConversationDao.create(organization.id, user2.id, user.token);
            expect(conversation2).to.have.property('id', conversation.id);
        });
    });

    describe('Create conversation with error', () => {
        var conversation;
        var user3;

        before(async () => {
            user3 = await TestDatabaseHelper.createUser();
        });

        it('conversation must not be created if user1 not belongs to organization', async () => {
           await  expect(ConversationDao.create(organization.id, user.id, user3.token)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });

        it('conversation must not be created if user2 not belongs to organization', async () => {
           await  expect(ConversationDao.create(organization.id, user3.id, user.token)).to.eventually.be.rejectedWith(UserNotBelongsToOrganizationError);
        });

        it('conversation must not be created if user1 is user2', async () => {
           await  expect(ConversationDao.create(organization.id, user.id, user.token)).to.eventually.be.rejectedWith(InvalidConversationError);
        });
    });

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
            org = await TestDatabaseHelper.createOrganization();
            usr = await TestDatabaseHelper.createUser();
            conversation = await TestDatabaseHelper.createConversation(user, usr, org);
            conversation2 = await TestDatabaseHelper.createConversation(user, usr, org);;
        });

        it('get for user and organization must return 2 conversations', async () => {
            var conversations = await ConversationDao.get(user.token, org.id);
            expect(conversations.length).to.eq(2);
        });

        it('get for other user and organization must return 0 channels', async () => {
            var usr2 = await TestDatabaseHelper.createUser();
            var conversations = await ConversationDao.get(usr2.token, org.id);
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
            usr = await TestDatabaseHelper.createUser();
            org = await TestDatabaseHelper.createOrganization();
            conversation = await TestDatabaseHelper.createConversation(user, usr, org);
        });

        it('find by user1 and user2 must return conversation', async () => {
            var conversation = await ConversationDao.findByUsers(org, user, usr);
            expect(conversation).to.not.be.null;
        });

        it('find by user1 and user2 must return conversation with correct id', async () => {
            var result = await ConversationDao.findByUsers(org, user, usr);
            expect(result).to.have.property('id', conversation.id);
        });

        it('find by user1 and other user must return null', async () => {
            var usr2 = await TestDatabaseHelper.createUser();
            var result = await ConversationDao.findByUsers(org, user, usr2);
            expect(result).to.be.null;
        });

    });
});
