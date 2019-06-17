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
var RequestStatsDao = require('../../src/daos/RequestStatsDao');
var TestException = require('../TestException');
const TestPermissionsMock = require('../TestPermissionsMock');
var { requestStatsData } = require('../data/requestStatsData');

describe('"AdminUsersController Tests"', () => {
    var data = {
        username: "admin",
        password: "password"
    };

    describe('Methods without errors', () => {
        var mock1, mock2;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(AdminUserDao, 'login').resolves(adminMock);
            mock2 = stub(RequestStatsDao, 'get').resolves(requestStatsData);
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
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

        describe('Get Request Stats', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await AdminUsersController.getRequestStats(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('stats must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('returned stats must have correct data', async () => {
                var response = res.send.args[0][0];
                expect(response).to.eq(requestStatsData);
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1, mock2;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(AdminUserDao, 'login').rejects(TestException);
            mock2 = stub(RequestStatsDao, 'get').rejects(TestException);
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
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

        describe('Get request stats with error', () => {
            var req = mockRequest({body: data});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await AdminUsersController.getRequestStats(req, res);
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

    describe('Methods with permission errors', () => {

        before(async () => {
            TestPermissionsMock.rejectPermissions();
        });

        after(async () => {
            TestPermissionsMock.restore();
        });

        describe('Get request stats with permission error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await AdminUsersController.getRequestStats(req, res);
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
