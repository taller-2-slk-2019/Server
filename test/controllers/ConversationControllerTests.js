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
var TestException = require('../TestException');

describe('"ConversationsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;

        before(async () => {
            mock1 = stub(ConversationDao, 'get').resolves([conversationWithUsersDataMock, conversationWithUsersDataMock]);
            mock2 = stub(ConversationDao, 'create').resolves(conversationWithUsersDataMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });

        describe('Create conversation', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ConversationsController.create(req, res);
            });

            it('response status must be 201', async () => {
                expect(res.status).to.have.been.calledWith(201);
            });

            it('conversation must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('returned conversation must have an id', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('id', conversationWithUsersDataMock.id);
            });
        });

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
        var mock2;

        before(async () => {
            mock1 = stub(ConversationDao, 'get').rejects(TestException);
            mock2 = stub(ConversationDao, 'create').rejects(TestException);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });


        describe('Create conversation with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ConversationsController.create(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get conversations with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ConversationsController.get(req, res);
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
});
