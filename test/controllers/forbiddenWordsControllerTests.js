const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const forbiddenWordMock = require('../mocks/forbiddenWordMock');

var ForbiddenWordsController = require('../../src/controllers/ForbiddenWordsController');
var ForbiddenWordDao = require('../../src/daos/ForbiddenWordDao');
/*
describe('"ForbiddenWordsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            mock1 = stub(ForbiddenWordDao, 'get').resolves([forbiddenWordMock, forbiddenWordMock, forbiddenWordMock]);
            mock2 = stub(ForbiddenWordDao, 'create').resolves();
            mock3 = stub(ForbiddenWordDao, 'delete').resolves();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });

        describe('Add word', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.add(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('success must be returned', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('success');
            });
        });

        describe('Delete word', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.delete(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('success must be returned', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('success');
            });
        });

        describe('Get words', () => {
            var req = mockRequest();
            var res;
            var words;

            beforeEach(async () => {
                res = mockResponse();
                words = await ForbiddenWordsController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('words must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('forbiddenWords').with.length.above(0);
            });

            it('words must have a word', async () => {
                var response = res.send.args[0][0];
                expect(response.forbiddenWords[0]).to.have.property('word');
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            mock1 = stub(ForbiddenWordDao, 'get').rejects();
            mock2 = stub(ForbiddenWordDao, 'create').rejects();
            mock3 = stub(ForbiddenWordDao, 'delete').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });


        describe('Add word with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.add(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Delete word with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.delete(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get words with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.get(req, res);
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
*/