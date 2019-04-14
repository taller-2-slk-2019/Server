const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var FirebaseController = require('../../src/firebase/FirebaseController');

var messageMock = require('../mocks/messageMock');

describe('"FirebaseController Tests"', () => {
    var mock;

    before(async () => {
        mock = stub(FirebaseController, '_sendToFirebase').returns(true);
    });

    beforeEach(async () => {
        mock.resetHistory();
    });

    after(async () => {
        mock.restore();
    });

    describe('Send Message', () => {
    
        describe('Send channel message', () => {
            var channelMessageMock = Object.create(messageMock);

            beforeEach(async () => {
                mock.resetHistory();
                FirebaseController.sendMessage(channelMessageMock);
            });

            it('should send message to firebase', async () => {
                assert.calledOnce(mock);
            });

            it('should send message to topic channel', async () => {
                var args = mock.getCall(0).args[0];
                expect(args).to.have.property('topic', 'channel_' + channelMessageMock.channelId);
            });
        });

        describe('Send conversation message', () => {
            var conversationMessageMock = Object.create(messageMock);
            conversationMessageMock.channelId = null;
            conversationMessageMock.conversationId = 1;

            beforeEach(async () => {
                mock.resetHistory();
                FirebaseController.sendMessage(conversationMessageMock);
            });

            it('should send message to firebase', async () => {
                assert.calledOnce(mock);
            });

            it('should send message to topic conversation', async () => {
                var args = mock.getCall(0).args[0];
                expect(args).to.have.property('topic', 'conversation_' + conversationMessageMock.conversationId);
            });
        });

        describe('Send message without conversation or channel', () => {
            var message = Object.create(messageMock);
            message.channelId = null;
            message.conversationId = null;

            beforeEach(async () => {
                mock.resetHistory();
                FirebaseController.sendMessage(message);
            });

            it('should not send message to firebase', async () => {
                assert.notCalled(mock);
            });
        });
    });
});
