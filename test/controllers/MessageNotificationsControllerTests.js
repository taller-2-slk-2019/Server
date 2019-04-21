const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var MessageNotificationsController = require('../../src/controllers/MessageNotificationsController');
var FirebaseController = require('../../src/firebase/FirebaseController');

var models = require('../../src/database/sequelize');
var Message = models.message;
var Channel = models.channel;
var User = models.user;
var Organization = models.organization;
var { messageCreateData } = require('../data/messageData');
var { channelCreateData } = require('../data/channelData');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');
var messageMock = require('../mocks/messageMock');

describe('"MessageNotificationsController Tests"', () => {
    var mock;

    before(async () => {
        mock = stub(FirebaseController, 'sendChannelMessageNotification').resolves();
    });

    beforeEach(async () => {
        mock.resetHistory();
    });

    after(async () => {
        mock.restore();
    });

    describe('Send Message Notification', () => {
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
            await channel.setUsers([user1, user2, user3]);
            messageData.senderId = user1.id;
            messageData.channelId = channel.id;
        });
    
        describe('Send message notifications only to mentioned users', () => {
            beforeEach(async () => {
                mock.resetHistory();
                var data = Object.create(messageData);
                data.data = `@${user1.username} @${user2.username} @otherUser`;
                message = await Message.create(data);
                await MessageNotificationsController.sendNotification(message);
            });

            it('must send notification to user2', async () => {
                var users = mock.getCall(0).args[1];
                expect(users).to.include(user2.username);
            });

            it('must not send notification to sender', async () => {
                var users = mock.getCall(0).args[1];
                expect(users).to.not.include(user1.username);
            });

            it('must not send notification to non mentioned user', async () => {
                var users = mock.getCall(0).args[1];
                expect(users).to.not.include(user3.username);
            });

            it('must not send notification to users that do not belong to channel', async () => {
                var users = mock.getCall(0).args[1];
                expect(users).to.not.include('otherUser');
            });
        });

        describe('Send message notifications to all users', () => {
            beforeEach(async () => {
                mock.resetHistory();
                var data = Object.create(messageData);
                data.data = `@all`;
                message = await Message.create(data);
                await MessageNotificationsController.sendNotification(message);
            });

            it('must send notification to user2', async () => {
                var users = mock.getCall(0).args[1];
                expect(users).to.include(user2.username);
            });

            it('must send notification to user3', async () => {
                var users = mock.getCall(0).args[1];
                expect(users).to.include(user3.username);
            });

            it('must not send notification to sender', async () => {
                var users = mock.getCall(0).args[1];
                expect(users).to.not.include(user1.username);
            });

            it('must send to all users', async () => {
                var channelUsers = await channel.getUsers();
                var users = mock.getCall(0).args[1];
                expect(channelUsers.length).to.eq(users.length + 1);
            });
        });
    });

    describe('Not sent notifications', () => {
        
        beforeEach(async () => {
            mock.resetHistory();
        });

        it('should do nothing if is a conversation message', async () => {
            var conversationMessageMock = Object.create(messageMock);
            conversationMessageMock.channelId = null;
            conversationMessageMock.conversationId = 1;
            await MessageNotificationsController.sendNotification(conversationMessageMock);
            assert.notCalled(mock);
        });

        it('should do nothing if is not a text message', async () => {
            var fileMessageMock = Object.create(messageMock);
            fileMessageMock.type = "file";
            await MessageNotificationsController.sendNotification(fileMessageMock);
            assert.notCalled(mock);
        });
    });
});
