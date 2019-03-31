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

var ChannelsController = require('../../src/controllers/ChannelsController');
var ChannelDao = require('../../src/daos/ChannelDao');

describe('"ChannelsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;

        before(async () => {
            mock1 = stub(ChannelDao, 'create').resolves(channelDataMock);
            mock2 = stub(ChannelDao, 'addUser').resolves();
            mock3 = stub(ChannelDao, 'removeUser').resolves();
            mock4 = stub(ChannelDao, 'get').resolves([channelDataMock, channelDataMock, channelDataMock]);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
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

        describe('Remove user', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.removeUser(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have a success', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('success');
            });
        });

        describe('Get channels', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have channels', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });

            it('response must have 3 channels', async () => {
                var response = res.send.args[0][0];
                expect(response.length).to.eq(3);
            });
        });

    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;

        before(async () => {
            mock1 = stub(ChannelDao, 'create').rejects();
            mock2 = stub(ChannelDao, 'addUser').rejects();
            mock3 = stub(ChannelDao, 'removeUser').rejects();
            mock4 = stub(ChannelDao, 'get').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
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

        describe('Add user with error', () => {
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

        describe('Remove user with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.removeUser(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get channels with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.get(req, res);
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
