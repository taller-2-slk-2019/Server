const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const channelDataMock = require('../mocks/channelDataMock');
const userDataMock = require('../mocks/userForChannelMock');
const channelStatisticsMock = require('../mocks/channelStatisticsMock');
const { channelCreateData } = require('../data/channelData');

var ChannelsController = require('../../src/controllers/ChannelsController');
var ChannelDao = require('../../src/daos/ChannelDao');
var AdminDao = require('../../src/daos/AdminUserDao');
const adminMock = require('../mocks/adminMock');

describe('"ChannelsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1, mock2, mock3, mock4, mock5, mock6, mock7, mock8, mock9;

        before(async () => {
            mock1 = stub(ChannelDao, 'create').resolves(channelDataMock);
            mock2 = stub(ChannelDao, 'addUser').resolves();
            mock3 = stub(ChannelDao, 'removeUser').resolves();
            mock4 = stub(ChannelDao, 'get').resolves([channelDataMock, channelDataMock, channelDataMock]);
            mock5 = stub(ChannelDao, 'findById').resolves(channelDataMock);
            mock6 = stub(ChannelDao, 'getChannelUsers').resolves([userDataMock, userDataMock, userDataMock]);
            mock7 = stub(ChannelDao, 'getStatistics').resolves(channelStatisticsMock);
            mock8 = stub(ChannelDao, 'delete').resolves();
            mock9 = stub(AdminDao, 'findByToken').resolves(adminMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
            mock8.restore();
            mock9.restore();
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

        describe('Get channel users', () => {
            var req = mockRequest({});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.getChannelUsers(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have users', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });

            it('user id must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('id', userDataMock.id);
            });

            it('users must have channel id', async () => {
                var response = res.send.args[0][0];
                expect(response[0].channelUsers).to.have.property('channelId');
            });
        });

        describe('Add user', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.addUser(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Remove user', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.removeUser(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Delete channel', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.delete(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
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

        describe('Get channel', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.getChannel(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('channel must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('channel id must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('id', channelDataMock.id);
            });
        });

        describe('Get statistics', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.getStatistics(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('stats must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('message count must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('messageCount', channelStatisticsMock.messageCount);
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1, mock2, mock3, mock4, mock5, mock6, mock7, mock8, mock9;

        before(async () => {
            mock1 = stub(ChannelDao, 'create').rejects();
            mock2 = stub(ChannelDao, 'addUser').rejects();
            mock3 = stub(ChannelDao, 'removeUser').rejects();
            mock4 = stub(ChannelDao, 'get').rejects();
            mock5 = stub(ChannelDao, 'findById').rejects();
            mock6 = stub(ChannelDao, 'getChannelUsers').rejects();
            mock7 = stub(ChannelDao, 'getStatistics').rejects();
            mock8 = stub(ChannelDao, 'delete').rejects();
            mock9 = stub(AdminDao, 'findByToken').resolves(adminMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
            mock8.restore();
            mock9.restore();
        });


        describe('Create channel with error', () => {
            var req = mockRequest({ body: channelCreateData });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.create(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get channel users with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.getChannelUsers(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Delete channel with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.delete(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get channel with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.getChannel(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get statistics with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.getStatistics(req, res);
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
        var mock1, mock2;

        before(async () => {
            mock1 = stub(ChannelDao, 'delete').rejects();
            mock2 = stub(AdminDao, 'findByToken').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });

        describe('Delete channel with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ChannelsController.delete(req, res);
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
