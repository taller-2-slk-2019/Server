const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const conversationWithUsersDataMock = require('../mocks/conversationWithUsersDataMock');
const { conversationCreateData } = require('../data/conversationData');

var ConversationsController = require('../../src/controllers/ConversationsController');
var ConversationDao = require('../../src/daos/ConversationDao');

describe('"ConversationsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;

        before(async () => {
            mock1 = stub(ConversationDao, 'get').resolves([conversationCreateData, conversationCreateData]);
        });

        after(async () => {
            mock1.restore();
        });

        /*describe('Create channel', () => {
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
        });*/

        describe('Get conversations', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ConversationsController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have conversations', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });

            it('response must have 2 conversations', async () => {
                var response = res.send.args[0][0];
                expect(response.length).to.eq(2);
            });
        });

    });

    describe('Methods with errors', () => {
        var mock1;

        before(async () => {
            mock1 = stub(ConversationDao, 'get').rejects();
        });

        after(async () => {
            mock1.restore();
        });


        /*describe('Create channel with error', () => {
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
        });*/

        describe('Get conversations with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ConversationsController.get(req, res);
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
