const sha1 = require('sha1');
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const adminMock = require('../mocks/adminMock');

var AdminUsersController = require('../../src/controllers/AdminUsersController');
var AdminUserDao = require('../../src/daos/AdminUserDao');
var TestException = require('../TestException');

describe('"AdminUsersController Tests"', () => {
    var data = {
        username: "admin",
        password: "password"
    };

    describe('Methods without errors', () => {
        var mock1;

        before(async () => {
            mock1 = stub(AdminUserDao, 'login').resolves(adminMock);
        });

        after(async () => {
            mock1.restore();
        });

        describe('Login', () => {
            var req = mockRequest({body: data});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await AdminUsersController.login(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('admin must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });
            
            it('admin must have the correct id', async () => {
                var response = res.send.args[0][0];
                expect(response.id).to.eq(adminMock.id);
            });

            it('admin must have the correct token', async () => {
                var response = res.send.args[0][0];
                expect(response.token).to.eq(adminMock.token);
            });

            it('login should be called with hashed password', async () => {
                var args = mock1.getCall(0).args[1];
                expect(args).to.eq(sha1(data.password));
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1;

        before(async () => {
            mock1 = stub(AdminUserDao, 'login').rejects(TestException);
        });

        after(async () => {
            mock1.restore();
        });


        describe('Login with error', () => {
            var req = mockRequest({body: data});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await AdminUsersController.login(req, res);
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
