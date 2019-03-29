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

describe('"MessagesController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;

        before(async () => {
            mock1 = stub(MessageDao, 'create').resolves();
            mock2 = stub(MessageDao, 'get').resolves([messageMock, messageMock, messageMock]);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });

        describe('Create Message', () => {
            var req = mockRequest({ body: messageCreateData });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('must return a success', async () => {
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
                messages = await MessagesController.get(req, res);
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

        before(async () => {
            mock1 = stub(MessageDao, 'create').rejects();
            mock2 = stub(MessageDao, 'get').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });


        describe('Create message with error', () => {
            var req = mockRequest({ body: messageCreateData });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await MessagesController.create(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
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

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
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
                await MessagesController.get(req, res);
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
