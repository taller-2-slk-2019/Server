const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const channelDataMock = require('../mocks/channelDataMock');
const { channelCreateData } = require('../data/channelData');
const messageMock = require('../mocks/messageMock');

var ChannelsController = require('../../src/controllers/ChannelsController');
var ChannelDao = require('../../src/daos/ChannelDao');
var MessageDao = require('../../src/daos/MessageDao');

describe('"ChannelsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            mock1 = stub(ChannelDao, 'create').resolves(channelDataMock);
            mock2 = stub(ChannelDao, 'addUser').resolves();
            mock3 = stub(MessageDao, 'get').resolves([messageMock, messageMock, messageMock]);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });

        describe('Create channel', () => {
            var req = mockRequest({ body: channelCreateData });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.create(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('channel must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('returned channel must have an id', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('id', channelDataMock.id);
            });
        });

        describe('Add user', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.addUser(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('success must be returned', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('success');
            });
        });

        describe('Get messages', () => {
            var req = mockRequest();
            var res;
            var messages;

            beforeEach(async () => {
                res = mockResponse();
                messages = await ChannelsController.getMessages(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('messages must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('messages').with.length.above(0);
            });

            it('messages must have sender', async () => {
                var response = res.send.args[0][0];
                expect(response.messages[0]).to.have.property('sender');
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            mock1 = stub(ChannelDao, 'create').rejects();
            mock2 = stub(ChannelDao, 'addUser').rejects();
            mock3 = stub(MessageDao, 'get').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });


        describe('Create channel with error', () => {
            var req = mockRequest({ body: channelCreateData });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.create(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create channel with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.addUser(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get messages with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.getMessages(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    });
});
