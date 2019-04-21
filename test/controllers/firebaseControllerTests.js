const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var FirebaseController = require('../../src/firebase/FirebaseController');

var messageMock = require('../mocks/messageMock');
var models = require('../../src/database/sequelize');
var Message = models.message;
var Channel = models.channel;
var User = models.user;
var Organization = models.organization;
var FirebaseToken = models.firebaseToken;
var { messageCreateData } = require('../data/messageData');
var { channelCreateData } = require('../data/channelData');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"FirebaseController Tests"', () => {
    var mockTopics;
    var mockUsers;

    before(async () => {
        mockTopics = stub(FirebaseController, '_sendToFirebaseTopic').returns(true);
        mockUsers = stub(FirebaseController, '_sendToFirebaseDevices').returns(true);
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
                FirebaseController.sendMessage(channelMessageMock);
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
                FirebaseController.sendMessage(conversationMessageMock);
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
                FirebaseController.sendMessage(message);
            });

            it('should not send message to firebase', async () => {
                assert.notCalled(mockTopics);
            });
        });
    });

    describe('Send channel Message notification', () => {
        var user1, user2, user3;
        var organization;
        var channel;
        var message;
        var organizationData = Object.create(organizationCreateData);
        var channelData = Object.create(channelCreateData);
        var messageData = Object.create(messageCreateData);

        before(async () => {
            user1 = await User.create(userCreateData());
            user2 = await User.create(userCreateData());
            user3 = await User.create(userCreateData());
            organizationData.creatorId = user1.id;
            organization = await Organization.create(organizationData);
            channelData.creatorId = user1.id;
            channelData.organizationId = organization.id;
            channel = await Channel.create(channelData);
            messageData.senderId = user1.id;
            messageData.channelId = channel.id;
            message = await Message.create(messageData);

            await FirebaseToken.create({userId: user1.id, token: 'token11'});
            await FirebaseToken.create({userId: user2.id, token: 'token22'});
            await FirebaseToken.create({userId: user2.id, token: 'token33'});
        });

        beforeEach(async () => {
            mockUsers.resetHistory();
        });

        it('should send message to firebase', async () => {
            await FirebaseController.sendChannelMessageNotification(message, [user1.username, user2.username, user3.username]);
            assert.calledOnce(mockUsers);
        });

        it('should send message to correct user tokens', async () => {
            await FirebaseController.sendChannelMessageNotification(message, [user1.username, user2.username, user3.username]);
            var args = mockUsers.getCall(0).args[1];
            expect(args).to.include('token11');
            expect(args).to.include('token22');
            expect(args).to.include('token33');
        });

        it('should do nothing if no tokens are provided', async () => {
            await FirebaseController.sendChannelMessageNotification(message, [user3.username]);
            assert.notCalled(mockUsers);
        });
    });
});
