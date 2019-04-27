const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
var axios = require('axios');
var AxiosMock = require('axios-mock-adapter');

var BotsController = require('../../src/controllers/BotsController');
var messageMock = require('../mocks/messageMock');

describe('"BotsController Tests"', () => {
    var mock;
    var bot;

    before(async () => {
        bot = {
            name: 'pepe',
            url: 'pepe.com'
        }

        messageMock.data = "@pepe hello"

        mock = new AxiosMock(axios);
        mock.onPost('pepe.com').reply(200, {});
    });

    beforeEach(async () => {
        mock.reset();
    });

    after(async () => {
        mock.restore();
    });

    describe('Send Message To bot', () => {
        beforeEach(async () => {
            mock.resetHistory();
            await BotsController.sendMessageToBot(bot, messageMock);
        });

        it('should send message to bot', async () => {
            expect(mock.history.post.length).to.eq(1);
        });

        it('should send message to bot without bot mention', async () => {
            expect(JSON.parse(mock.history.post[0].data).message).to.not.include('pepe');
        });
    });
});
