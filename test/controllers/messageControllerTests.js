const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const { messageCreateData } = require('../data/messageData');

var MessagesController = require('../../src/controllers/MessagesController');
var MessageDao = require('../../src/daos/MessageDao');

describe('"MessagesController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;

        before(async () => {
            mock1 = stub(MessageDao, 'create').resolves();
        });

        after(async () => {
            mock1.restore();
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
    });

    describe('Methods with errors', () => {
        var mock1;

        before(async () => {
            mock1 = stub(MessageDao, 'create').rejects();
        });

        after(async () => {
            mock1.restore();
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
    });
});
