const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
var axios = require('axios');
var AxiosMock = require('axios-mock-adapter');

var TitoBotController = require('../../src/controllers/TitoBotController');
var BotsController = require('../../src/controllers/BotsController');
var TestDatabaseHelper = require('../TestDatabaseHelper');

var messageMock = require('../mocks/messageMock');

describe('"TitoBotController Tests"', () => {
    var mock, mock2;

    before(async () => {
        mock = stub(BotsController, 'sendMessageToBot').resolves();
        mock2 = new AxiosMock(axios);
        mock2.onPost(TitoBotController.titoBotBaseUrl + 'welcome').reply(200, {});
        mock2.onPost(TitoBotController.titoBotBaseUrl + 'channel').reply(200, {});
        mock2.onPost(TitoBotController.titoBotBaseUrl + 'conversation').reply(200, {});
    });

    beforeEach(async () => {
        mock.resetHistory();
        mock2.reset();
    });

    after(async () => {
        mock.restore();
        mock2.restore();
    });

    describe('Send Message', () => {
        beforeEach(async () => {
            mock.resetHistory();
            await TitoBotController.sendMessage(messageMock);
        });

        it('should send message to bot', async () => {
            assert.calledOnce(mock);
        });

        it('should send message with bot name', async () => {
            var args = mock.getCall(0).args[0];
            expect(args).to.have.property('name', TitoBotController.titoBotName);
        });

        it('should send message with bot url', async () => {
            var args = mock.getCall(0).args[0];
            expect(args.url).to.include('/bot');
        });

        it('should send message with message', async () => {
            var args = mock.getCall(0).args[1];
            expect(args.id).to.eq(messageMock.id);
        });
    });

    describe('User Added To Channel', () => {
        var user, organization, channel;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, organization);
        });

        beforeEach(async () => {
            mock2.reset();
            await TitoBotController.userAddedToChannel(channel, user);
        });

        it('should send message to bot', async () => {
            expect(mock2.history.post.length).to.eq(1);
        });

        it('should send message with channelId', async () => {
            expect(JSON.parse(mock2.history.post[0].data).channelId).to.eq(channel.id);
        });

        it('should send message with userId', async () => {
            expect(JSON.parse(mock2.history.post[0].data).userId).to.eq(user.id);
        });
    });

    describe('Channel created', () => {
        var user, organization, channel;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, organization);
        });

        beforeEach(async () => {
            mock2.reset();
            await TitoBotController.channelCreated(channel);
        });

        it('should send message to bot', async () => {
            expect(mock2.history.post.length).to.eq(1);
        });

        it('should send message with channelId', async () => {
            expect(JSON.parse(mock2.history.post[0].data).channelId).to.eq(channel.id);
        });

        it('should send message with userId', async () => {
            expect(JSON.parse(mock2.history.post[0].data).userId).to.eq(user.id);
        });
    });

    describe('Conversation created', () => {
        var user, user2, organization, conversation;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);
            conversation = await TestDatabaseHelper.createConversation(user, user2, organization);
        });

        beforeEach(async () => {
            mock2.reset();
            await TitoBotController.conversationCreated(conversation, user);
        });

        it('should send message to bot', async () => {
            expect(mock2.history.post.length).to.eq(1);
        });

        it('should send message with conversationId', async () => {
            expect(JSON.parse(mock2.history.post[0].data).conversationId).to.eq(conversation.id);
        });

        it('should send message with userId', async () => {
            expect(JSON.parse(mock2.history.post[0].data).userId).to.eq(user.id);
        });
    });
});
