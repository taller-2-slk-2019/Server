const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var FirebaseService = require('../../src/firebase/FirebaseService');

var messageMock = require('../mocks/messageMock');
var models = require('../../src/database/sequelize');
var TestDatabaseHelper = require('../TestDatabaseHelper');
var FirebaseToken = models.firebaseToken;

describe('"FirebaseService Tests"', () => {
    var mockTopics;
    var mockUsers;

    before(async () => {
        mockTopics = stub(FirebaseService, '_sendToFirebaseTopic').returns(true);
        mockUsers = stub(FirebaseService, '_sendToFirebaseDevices').returns(true);
    });

    beforeEach(async () => {
        mockTopics.resetHistory();
        mockUsers.resetHistory();
    });

    after(async () => {
        mockTopics.restore();
        mockUsers.restore();
    });

    describe('Send Message', () => {
    
        describe('Send channel message', () => {
            var channelMessageMock = Object.create(messageMock);

            beforeEach(async () => {
                mockTopics.resetHistory();
                FirebaseService.sendMessage(channelMessageMock);
            });

            it('should send message to firebase', async () => {
                assert.calledOnce(mockTopics);
            });

            it('should send message to topic channel', async () => {
                var args = mockTopics.getCall(0).args[0];
                expect(args).to.have.property('topic', 'channel_' + channelMessageMock.channelId);
            });
        });

        describe('Send conversation message', () => {
            var conversationMessageMock = Object.create(messageMock);
            conversationMessageMock.channelId = null;
            conversationMessageMock.conversationId = 1;

            beforeEach(async () => {
                mockTopics.resetHistory();
                FirebaseService.sendMessage(conversationMessageMock);
            });

            it('should send message to firebase', async () => {
                assert.calledOnce(mockTopics);
            });

            it('should send message to topic conversation', async () => {
                var args = mockTopics.getCall(0).args[0];
                expect(args).to.have.property('topic', 'conversation_' + conversationMessageMock.conversationId);
            });
        });

        describe('Send message without conversation or channel', () => {
            var message = Object.create(messageMock);
            message.channelId = null;
            message.conversationId = null;

            beforeEach(async () => {
                mockTopics.resetHistory();
                FirebaseService.sendMessage(message);
            });

            it('should not send message to firebase', async () => {
                assert.notCalled(mockTopics);
            });
        });
    });

    describe('Send channel mention notification', () => {
        var user1, user2, user3;
        var organization;
        var channel;
        var message;

        before(async () => {
            user1 = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            user3 = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user1]);
            channel = await TestDatabaseHelper.createChannel(user1, organization);
            message = await TestDatabaseHelper.createChannelMessage("hello", channel, user1);

            await FirebaseToken.create({userId: user1.id, token: 'token11'});
            await FirebaseToken.create({userId: user2.id, token: 'token22'});
            await FirebaseToken.create({userId: user2.id, token: 'token33'});
        });

        beforeEach(async () => {
            mockUsers.resetHistory();
        });

        it('should send message to firebase', async () => {
            await FirebaseService.sendChannelMessageNotification(message, [user1.username, user2.username, user3.username]);
            assert.calledOnce(mockUsers);
        });

        it('should send message to correct user tokens', async () => {
            await FirebaseService.sendChannelMessageNotification(message, [user1.username, user2.username, user3.username]);
            var args = mockUsers.getCall(0).args[1];
            expect(args).to.include('token11');
            expect(args).to.include('token22');
            expect(args).to.include('token33');
        });

        it('should do nothing if no tokens are provided', async () => {
            await FirebaseService.sendChannelMessageNotification(message, [user3.username]);
            assert.notCalled(mockUsers);
        });
    });

    describe('Send organization invitation notification', () => {
        var user, user2;
        var organization;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);

            await FirebaseToken.create({userId: user.id, token: 'token111'});
            await FirebaseToken.create({userId: user.id, token: 'token222'});
        });

        beforeEach(async () => {
            mockUsers.resetHistory();
        });

        it('should send message to firebase', async () => {
            await FirebaseService.sendOrganizationInvitationNotification(user, organization);
            assert.calledOnce(mockUsers);
        });

        it('should send message to correct user tokens', async () => {
            await FirebaseService.sendOrganizationInvitationNotification(user, organization);
            var args = mockUsers.getCall(0).args[1];
            expect(args).to.include('token111');
            expect(args).to.include('token222');
        });

        it('should do nothing if no tokens are provided', async () => {
            await FirebaseService.sendOrganizationInvitationNotification(user2, organization);
            assert.notCalled(mockUsers);
        });
    });

    describe('Send channel invitation notification', () => {
        var user, user2;
        var organization;
        var channel;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, organization);

            await FirebaseToken.create({userId: user2.id, token: 'token1111'});
            await FirebaseToken.create({userId: user2.id, token: 'token2222'});
        });

        beforeEach(async () => {
            mockUsers.resetHistory();
        });

        it('should send message to firebase', async () => {
            await FirebaseService.sendChannelInvitationNotification(user2, channel);
            assert.calledOnce(mockUsers);
        });

        it('should send message to correct user tokens', async () => {
            await FirebaseService.sendChannelInvitationNotification(user2, channel);
            var args = mockUsers.getCall(0).args[1];
            expect(args).to.include('token1111');
            expect(args).to.include('token2222');
        });

        it('should do nothing if no tokens are provided', async () => {
            await FirebaseService.sendChannelInvitationNotification(user, channel);
            assert.notCalled(mockUsers);
        });

        it('should send correct channel', async () => {
            await FirebaseService.sendChannelInvitationNotification(user2, channel);
            var args = JSON.parse(mockUsers.getCall(0).args[0].data.channel);
            expect(args).to.have.property('id', channel.id);
        });
    });

    describe('Send conversation invitation notification', () => {
        var user, user2;
        var organization;
        var conversation;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);
            conversation = await TestDatabaseHelper.createConversation(user, user2, organization);

            await FirebaseToken.create({userId: user2.id, token: 'token0000'});
        });

        beforeEach(async () => {
            mockUsers.resetHistory();
        });

        it('should send message to firebase', async () => {
            await FirebaseService.sendConversationInvitationNotification(user2, user, conversation);
            assert.calledOnce(mockUsers);
        });

        it('should send message to correct user tokens', async () => {
            await FirebaseService.sendConversationInvitationNotification(user2, user, conversation);
            var args = mockUsers.getCall(0).args[1];
            expect(args).to.include('token0000');
        });

        it('should send correct conversation', async () => {
            await FirebaseService.sendConversationInvitationNotification(user2, user, conversation);
            var args = JSON.parse(mockUsers.getCall(0).args[0].data.conversation);
            expect(args).to.have.property('id', conversation.id);
        });

        it('should send correct user', async () => {
            await FirebaseService.sendConversationInvitationNotification(user2, user, conversation);
            var args = JSON.parse(mockUsers.getCall(0).args[0].data.user);
            expect(args).to.have.property('id', user.id);
        });
    });
});
