const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');

var BotsController = require('../../src/controllers/BotsController');
var BotDao = require('../../src/daos/BotDao');
var TestPermissionsMock = require('../TestPermissionsMock');
const botMock = require('../mocks/botMock');
var TestException = require('../TestException');

describe('"BotsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1, mock2, mock3;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(BotDao, 'create').resolves(botMock);
            mock2 = stub(BotDao, 'delete').resolves();
            mock3 = stub(BotDao, 'get').resolves([botMock, botMock]);
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });

        describe('Add bot', () => {
            var req = mockRequest();
            req.body.name = "bot";
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.create(req, res);
            });

            it('response status must be 201', async () => {
                expect(res.status).to.have.been.calledWith(201);
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
        var mock1, mock2, mock3;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(BotDao, 'create').rejects(TestException);
            mock2 = stub(BotDao, 'delete').rejects(TestException);
            mock3 = stub(BotDao, 'get').rejects(TestException);
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });

        describe('Add bot with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.body.name = "bot";
                res = mockResponse();
                await BotsController.create(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });

            describe('Add bot with spaces in name', () => {
                var req = mockRequest();
                var res;

                beforeEach(async () => {
                    req.body.name = "bot with spaces";
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

            describe('Add bot with tito name', () => {
                var req = mockRequest();
                var res;

                beforeEach(async () => {
                    req.body.name = "tito";
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
        });

        describe('Delete bot with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.delete(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
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

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    });

    describe('Methods with admin errors', () => {
        var mock1, mock2;

        before(async () => {
            TestPermissionsMock.rejectPermissions();
            mock1 = stub(BotDao, 'create').resolves();
            mock2 = stub(BotDao, 'delete').resolves();
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
        });

        describe('Add bot with errors', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await BotsController.create(req, res);
            });

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
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

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    });
});
