const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
var axios = require('axios');
var AxiosMock = require('axios-mock-adapter');

var BotsController = require('../../src/controllers/BotsController');
var BotDao = require('../../src/daos/BotDao');
var AdminDao = require('../../src/daos/AdminUserDao');
var messageMock = require('../mocks/messageMock');
const adminMock = require('../mocks/adminMock');
const botMock = require('../mocks/botMock');

describe('"BotsController Tests"', () => {
    describe('Send Message To bot', () => {
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
            await BotsController.sendMessageToBot(bot, messageMock);
        });

        after(async () => {
            mock.restore();
        });

        it('should send message to bot', async () => {
            expect(mock.history.post.length).to.eq(1);
        });

        it('should send message to bot without bot mention', async () => {
            expect(JSON.parse(mock.history.post[0].data).message).to.not.include('pepe');
        });
    });

    describe('Methods without errors', () => {
        var mock1, mock2, mock3, mock4;

        before(async () => {
            mock1 = stub(BotDao, 'create').resolves(botMock);
            mock2 = stub(BotDao, 'delete').resolves();
            mock3 = stub(AdminDao, 'findByToken').resolves(adminMock);
            mock4 = stub(BotDao, 'get').resolves([botMock, botMock]);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
        });

        describe('Add bot', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.create(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('bot must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });
            
            it('bot must have the correct name', async () => {
                var response = res.send.args[0][0];
                expect(response.name).to.eq(botMock.name);
            });
        });

        describe('Delete bot', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.delete(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Get bots', () => {
            var req = mockRequest();
            var res;
            var bots;

            beforeEach(async () => {
                res = mockResponse();
                bots = await BotsController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('words must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array').with.length.above(0);
            });

            it('bots must have a name and url', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('name');
                expect(response[0]).to.have.property('url');
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1, mock2, mock3, mock4;;

        before(async () => {
            mock1 = stub(BotDao, 'create').rejects();
            mock2 = stub(BotDao, 'delete').rejects();
            mock3 = stub(AdminDao, 'findByToken').resolves(adminMock);
            mock4 = stub(BotDao, 'get').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
        });

        describe('Add bot with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.create(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Delete bot with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.delete(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get bots with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.get(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    });

    describe('Methods with admin errors', () => {
        var mock1, mock2, mock3;

        before(async () => {
            mock1 = stub(BotDao, 'create').rejects();
            mock2 = stub(BotDao, 'delete').rejects();
            mock3 = stub(AdminDao, 'findByToken').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });

        describe('Add bot with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.create(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Delete bot with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.delete(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    });
});
