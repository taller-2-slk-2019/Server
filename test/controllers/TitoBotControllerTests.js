const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var TitoBotController = require('../../src/controllers/TitoBotController');
var BotsController = require('../../src/controllers/BotsController');

var messageMock = require('../mocks/messageMock');

describe('"TitoBotController Tests"', () => {
    var mock;

    before(async () => {
        mock = stub(BotsController, 'sendMessageToBot').resolves();
    });

    beforeEach(async () => {
        mock.resetHistory();
    });

    after(async () => {
        mock.restore();
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
});
