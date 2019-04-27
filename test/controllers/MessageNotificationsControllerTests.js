const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var MessageNotificationsController = require('../../src/controllers/MessageNotificationsController');
var FirebaseController = require('../../src/firebase/FirebaseController');
var TitoBotController = require('../../src/controllers/TitoBotController');

var TestDatabaseHelper = require('../TestDatabaseHelper');
var messageMock = require('../mocks/messageMock');

describe('"MessageNotificationsController Tests"', () => {
    var mock, mock2, firebaseMock;
    var user1, user2, user3;
    var organization;
    var channel;
    var message;

    before(async () => {
        firebaseMock = stub(FirebaseController, 'sendMessage').resolves();
        mock = stub(FirebaseController, 'sendChannelMessageNotification').resolves();
        mock2 = stub(TitoBotController, 'sendMessage').resolves();

        user1 = await TestDatabaseHelper.createUser();
        user2 = await TestDatabaseHelper.createUser();
        user3 = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user1]);
        channel = await TestDatabaseHelper.createChannel(user1, organization);
        await channel.setUsers([user1, user2, user3]);
    });

    beforeEach(async () => {
        mock.resetHistory();
        mock2.resetHistory();
    });

    after(async () => {
        firebaseMock.restore();
        mock.restore();
        mock2.restore();
    });

    describe('Send Message Notification', () => { 
        describe('Send message notifications only to mentioned users', () => {
            beforeEach(async () => {
                mock.resetHistory();
                var data = `@${user1.username} @${user2.username} @otherUser`;
                message = await TestDatabaseHelper.createChannelMessage(data, channel, user1);
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
                message = await TestDatabaseHelper.createChannelMessage("@all", channel, user1);
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

    describe('Mentioned Tito bot', () => {
        
        beforeEach(async () => {
            mock2.resetHistory();
        });

        it('should call tito controller if mentioned', async () => {
            message = await TestDatabaseHelper.createChannelMessage("@tito hello", channel, user1);
            await MessageNotificationsController.sendNotification(message);
            assert.calledOnce(mock2);
        });

        it('should call tito controller if mentioned with other users', async () => {
            message = await TestDatabaseHelper.createChannelMessage("@tito hello @other", channel, user1);
            await MessageNotificationsController.sendNotification(message);
            assert.calledOnce(mock2);
        });

        it('should not call tito controller if not mentioned', async () => {
            message = await TestDatabaseHelper.createChannelMessage("@titon hello", channel, user1);
            await MessageNotificationsController.sendNotification(message);
            assert.notCalled(mock2);
        });
    });
});
