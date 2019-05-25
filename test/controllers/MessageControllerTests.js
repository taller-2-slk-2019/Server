const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const { messageCreateData } = require('../data/messageData');
const messageMock = require('../mocks/messageMock');

var MessagesController = require('../../src/controllers/MessagesController');
var MessageDao = require('../../src/daos/MessageDao');
var TestException = require('../TestException');

describe('"MessagesController Tests"', () => {
    var messageData = Object.create(messageCreateData);

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;
        var mock5;

        before(async () => {
            mock1 = stub(MessageDao, 'createForChannel').resolves();
            mock2 = stub(MessageDao, 'getForChannel').resolves([messageMock, messageMock, messageMock]);
            mock3 = stub(MessageDao, 'createForConversation').resolves();
            mock4 = stub(MessageDao, 'getForConversation').resolves([messageMock, messageMock, messageMock]);
            mock5 = stub(MessageDao, 'createForBot').resolves();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
        });

        describe('Create Message for channel', () => {
            var req = mockRequest({ body: messageData });
            var res;

            beforeEach(async () => {
                req.body.channelId = 1;
                req.body.conversationId = null;
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be 201', async () => {
                expect(res.status).to.have.been.calledWith(201);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Create Message for conversation', () => {
            var req = mockRequest({ body: messageData });
            var res;

            beforeEach(async () => {
                req.body.conversationId = 1;
                req.body.channelId = null;
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be 201', async () => {
                expect(res.status).to.have.been.calledWith(201);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Create channel Message for bot', () => {
            var req = mockRequest();
            req.body.channelId = 1;
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await MessagesController.createBotMessage(req, res);
            });

            it('response status must be 201', async () => {
                expect(res.status).to.have.been.calledWith(201);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Create conversation Message for bot', () => {
            var req = mockRequest();
            req.body.conversationId = 1;
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await MessagesController.createBotMessage(req, res);
            });

            it('response status must be 201', async () => {
                expect(res.status).to.have.been.calledWith(201);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Get messages for channel', () => {
            var req = mockRequest();
            var res;
            var messages;

            beforeEach(async () => {
                req.query.channelId = 1;
                req.query.conversationId = null;
                res = mockResponse();
                messages = await MessagesController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('messages must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array').with.length.above(0);
            });

            it('messages must have sender', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('sender');
            });
        });

        describe('Get messages for conversation', () => {
            var req = mockRequest();
            var res;
            var messages;

            beforeEach(async () => {
                req.query.channelId = null;
                req.query.conversationId = 1;
                res = mockResponse();
                messages = await MessagesController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('messages must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array').with.length.above(0);
            });

            it('messages must have sender', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('sender');
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;
        var mock5;

        before(async () => {
            mock1 = stub(MessageDao, 'createForChannel').rejects(TestException);
            mock2 = stub(MessageDao, 'getForChannel').rejects(TestException);
            mock3 = stub(MessageDao, 'createForConversation').rejects(TestException);
            mock4 = stub(MessageDao, 'getForConversation').rejects(TestException);
            mock5 = stub(MessageDao, 'createForBot').rejects(TestException);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
        });


        describe('Create message for channel with error', () => {
            var req = mockRequest({ body: messageData });
            var res;

            beforeEach(async () => {
                req.body.channelId = 1;
                req.body.conversationId = null;
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create message for conversation with error', () => {
            var req = mockRequest({ body: messageData });
            var res;

            beforeEach(async () => {
                req.body.conversationId = 1;
                req.body.channelId = null;
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create message with invalid type', () => {
            var data = Object.create(messageCreateData);
            data.type = "invalid type";
            var req = mockRequest({ body: data });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create message for bot with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await MessagesController.createBotMessage(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create message with invalid data', () => {
            var data = Object.create(messageCreateData);
            data.data = "";
            var req = mockRequest({ body: data });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get messages for channel with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.query.channelId = 1;
                req.query.conversationId = null;
                res = mockResponse();
                await MessagesController.get(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get messages for conversation with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.query.channelId = null;
                req.query.conversationId = 1;
                res = mockResponse();
                await MessagesController.get(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create messages without channel or conversation', () => {
            var req = mockRequest({ body: messageData });
            var res;

            beforeEach(async () => {
                req.body.channelId = null;
                req.body.conversationId = null;
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get messages without channel or conversation', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.query.channelId = null;
                req.query.conversationId = null;
                res = mockResponse();
                await MessagesController.get(req, res);
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
