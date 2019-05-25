const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const forbiddenWordMock = require('../mocks/forbiddenWordMock');
const adminMock = require('../mocks/adminMock');

var ForbiddenWordsController = require('../../src/controllers/ForbiddenWordsController');
var ForbiddenWordDao = require('../../src/daos/ForbiddenWordDao');
var TestPermissionsMock = require('../TestPermissionsMock');
var TestException = require('../TestException');

describe('"ForbiddenWordsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(ForbiddenWordDao, 'get').resolves([forbiddenWordMock, forbiddenWordMock, forbiddenWordMock]);
            mock2 = stub(ForbiddenWordDao, 'create').resolves(forbiddenWordMock);
            mock3 = stub(ForbiddenWordDao, 'delete').resolves();
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });

        describe('Add word', () => {
            var req = mockRequest();
            req.body.word = "word";
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.add(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('forbidden word must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });
            
            it('forbidden word must be the correct word', async () => {
                var response = res.send.args[0][0];
                expect(response.word).to.eq(forbiddenWordMock.word);
            });
        });

        describe('Delete word', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.delete(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
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
                expect(response).to.be.an('array').with.length.above(0);
            });

            it('words must have a word', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('word');
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(ForbiddenWordDao, 'get').rejects(TestException);
            mock2 = stub(ForbiddenWordDao, 'create').rejects(TestException);
            mock3 = stub(ForbiddenWordDao, 'delete').rejects(TestException);
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });


        describe('Add word with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.body.word = "word";
                res = mockResponse();
                await ForbiddenWordsController.add(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });

            describe('Add invalid word', () => {
                beforeEach(async () => {
                    req.body.word = "word with spaces";
                    res = mockResponse();
                    await ForbiddenWordsController.add(req, res);
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

        describe('Delete word with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await ForbiddenWordsController.delete(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
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
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            TestPermissionsMock.rejectPermissions();
            mock1 = stub(ForbiddenWordDao, 'get').resolves();
            mock2 = stub(ForbiddenWordDao, 'create').resolves();
            mock3 = stub(ForbiddenWordDao, 'delete').resolves();
        });

        after(async () => {
            TestPermissionsMock.restore();
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

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
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
