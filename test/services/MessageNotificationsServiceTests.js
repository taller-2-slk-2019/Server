const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var MessageNotificationsService = require('../../src/services/MessageNotificationsService');
var FirebaseService = require('../../src/firebase/FirebaseService');
var TitoBotService = require('../../src/services/TitoBotService');
var BotsController = require('../../src/controllers/BotsController');
var ChannelDao = require('../../src/daos/ChannelDao');

var TestDatabaseHelper = require('../TestDatabaseHelper');
var messageMock = require('../mocks/messageMock');

describe('"MessageNotificationsService Tests"', () => {
    var mock, mock2, mock3, mock4, firebaseMock;
    var user1, user2, user3, user4;
    var organization;
    var channel;
    var message;

    before(async () => {
        firebaseMock = stub(FirebaseService, 'sendMessage').resolves();
        mock = stub(FirebaseService, 'sendChannelMessageNotification').resolves();
        mock2 = stub(TitoBotService, 'sendMessage').resolves();
        mock3 = stub(ChannelDao, 'addUsername').resolves();
        mock4 = stub(BotsController, 'sendMessageToBot').resolves();

        user1 = await TestDatabaseHelper.createUser();
        user2 = await TestDatabaseHelper.createUser();
        user3 = await TestDatabaseHelper.createUser();
        user4 = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user1]);
        channel = await TestDatabaseHelper.createChannel(user1, organization);
        await channel.setUsers([user1, user2, user3]);
    });

    beforeEach(async () => {
        mock.resetHistory();
        mock2.resetHistory();
        mock3.resetHistory();
        mock4.resetHistory();
    });

    after(async () => {
        firebaseMock.restore();
        mock.restore();
        mock2.restore();
        mock3.restore();
        mock4.restore();
    });

    describe('Send Message Notification', () => { 
        describe('Send message notifications only to mentioned users', () => {
            beforeEach(async () => {
                mock.resetHistory();
                var data = `@${user1.username} @${user2.username} @otherUser`;
                message = await TestDatabaseHelper.createChannelMessage(data, channel, user1);
                await MessageNotificationsService.sendNotification(message);
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
                await MessageNotificationsService.sendNotification(message);
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
            await MessageNotificationsService.sendNotification(conversationMessageMock);
            assert.notCalled(mock);
        });

        it('should do nothing if is not a text message', async () => {
            var fileMessageMock = Object.create(messageMock);
            fileMessageMock.type = "file";
            await MessageNotificationsService.sendNotification(fileMessageMock);
            assert.notCalled(mock);
        });
    });

    describe('Mentioned Tito bot', () => {
        
        beforeEach(async () => {
            mock2.resetHistory();
        });

        it('should call tito controller if mentioned', async () => {
            message = await TestDatabaseHelper.createChannelMessage("@tito hello", channel, user1);
            await MessageNotificationsService.sendNotification(message);
            assert.calledOnce(mock2);
        });

        it('should call tito controller if mentioned with other users', async () => {
            message = await TestDatabaseHelper.createChannelMessage("@tito hello @other", channel, user1);
            await MessageNotificationsService.sendNotification(message);
            assert.calledOnce(mock2);
        });

        it('should not call tito controller if not mentioned', async () => {
            message = await TestDatabaseHelper.createChannelMessage("@titon hello", channel, user1);
            await MessageNotificationsService.sendNotification(message);
            assert.notCalled(mock2);
        });
    });

    describe('Add mentioned users to channel if they do not belong', () => {
        beforeEach(async () => {
            mock.resetHistory();
            mock3.resetHistory();
            message = await TestDatabaseHelper.createChannelMessage("@" + user4.username, channel, user1);
            await MessageNotificationsService.sendNotification(message);
        });

        it('must not send notification to user4', async () => {
            var users = mock.getCall(0).args[1];
            expect(users).to.not.include(user4.username);
        });

        it('must add user to channel', async () => {
            var addedUser = mock3.getCall(0).args[1];
            expect(addedUser).to.eq(user4.username);
        });

        it('should not fail if can not add user to channel', async () => {
            var msg = await TestDatabaseHelper.createChannelMessage("@lalala", channel, user1);
            mock3.rejects();
            mock3.resetHistory();
            await MessageNotificationsService.sendNotification(msg);
            var addedUser = mock3.getCall(0).args[1];
            expect(addedUser).to.eq("lalala");
            mock3.resolves();
        });
    });

    describe('Mention a bot (not tito)', () => {
        var bot;

        before(async () => {
            bot  = await TestDatabaseHelper.createBot(organization, 'bot');
        });

        beforeEach(async () => {
            mock4.resetHistory();
            message = await TestDatabaseHelper.createChannelMessage("@bot hello", channel, user1);
            await MessageNotificationsService.sendNotification(message);
        });

        it('must call bot', async () => {
            assert.calledOnce(mock4);
        });

        it('should not send notifications', async () => {
            assert.notCalled(mock);
        });
    });

    describe('No mentions in the message', () => {
        var bot;

        before(async () => {
            bot  = await TestDatabaseHelper.createBot(organization, 'bot0');
        });

        beforeEach(async () => {
            mock.resetHistory();
            mock2.resetHistory();
            mock3.resetHistory();
            mock4.resetHistory();
        });

        it('no mentions should do nothing', async () => {
            message = await TestDatabaseHelper.createChannelMessage("hello channel", channel, user1);
            await MessageNotificationsService.sendNotification(message);
            assert.notCalled(mock2);
            assert.notCalled(mock3);
            assert.notCalled(mock4);
        });

        it('bot should be first mentioned', async () => {
            message = await TestDatabaseHelper.createChannelMessage("hello channel @lalal @bot0 help", channel, user1);
            await MessageNotificationsService.sendNotification(message);
            assert.notCalled(mock2);
            assert.notCalled(mock4);
        });
    });
});
