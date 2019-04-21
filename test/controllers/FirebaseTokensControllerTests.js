const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');

var FirebaseTokensController = require('../../src/firebase/FirebaseTokensController');
var FirebaseTokensDao = require('../../src/firebase/FirebaseTokensDao');

describe('"FirebaseTokensController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;

        before(async () => {
            mock1 = stub(FirebaseTokensDao, 'addToken').resolves();
            mock2 = stub(FirebaseTokensDao, 'removeToken').resolves();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });

        describe('Add token', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await FirebaseTokensController.addToken(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Remove token', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await FirebaseTokensController.removeToken(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;

        before(async () => {
            mock1 = stub(FirebaseTokensDao, 'addToken').rejects();
            mock2 = stub(FirebaseTokensDao, 'removeToken').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });
      
        describe('Add token', () => {
            var req = mockRequest();
            var res;
            
            beforeEach(async () => {
                res = mockResponse();
                await FirebaseTokensController.addToken(req, res);
            });

            it('response status must be 400', async () => { 
                expect(res.status).to.have.been.calledWith(400);
            });
            
            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Remove token', () => {
            var req = mockRequest();
            var res;
            
            beforeEach(async () => {
                res = mockResponse();
                await FirebaseTokensController.removeToken(req, res);
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
