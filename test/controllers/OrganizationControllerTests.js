const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const TestPermissionsMock = require('../TestPermissionsMock');

const organizationDataMock = require('../mocks/organizationDataMock');
const organizationsForUserMock = require('../mocks/organizationsForUserMock');
const { organizationCreateData } = require('../data/organizationData');

var OrganizationsController = require('../../src/controllers/OrganizationsController');
var OrganizationDao = require('../../src/daos/OrganizationDao');
var UserRoleDao = require('../../src/daos/UserRoleDao');
var OrganizationService = require('../../src/services/OrganizationService');
var UserService = require('../../src/services/UserService');
var organizationMessageCountMock = require('../mocks/messageCountByOrganizationMock');
var organizationUserCountMock = require('../mocks/userRolesCountByOrganizationMock');
var OrganizationStatistics = require('../../src/models/statistics/OrganizationStatistics');
var TestException = require('../TestException');

describe('"OrganizationsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1, mock2, mock3, mock4, mock5, mock6, mock7, mock8, 
            mock9, mock10, mock11, mock12;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(OrganizationDao, 'findById').resolves(organizationDataMock);
            mock2 = stub(OrganizationDao, 'create').resolves(organizationDataMock);
            mock3 = stub(OrganizationService, 'inviteUsers').resolves(["mail1", "mail2"]);
            mock4 = stub(UserService, 'findUserOrganizations').resolves([organizationsForUserMock, organizationsForUserMock]);
            mock5 = stub(OrganizationService, 'acceptUserInvitation').resolves();
            mock6 = stub(OrganizationService, 'removeUser').resolves();
            mock7 = stub(OrganizationDao, 'get').resolves([organizationDataMock, organizationDataMock]);
            mock8 = stub(OrganizationDao, 'delete').resolves();
            mock9 = stub(OrganizationService, 'getStatistics').resolves(
                new OrganizationStatistics(organizationUserCountMock, organizationMessageCountMock));
            mock10 = stub(UserRoleDao, 'updateUserRole').resolves();
            mock11 = stub(OrganizationDao, 'update').resolves();
            mock12 = stub(OrganizationService, 'abandonUser').resolves();
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
            mock8.restore();
            mock9.restore();
            mock10.restore();
            mock11.restore();
            mock12.restore();
        });

        describe('Get Profile Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = organizationDataMock.id;
                res = mockResponse();
                await OrganizationsController.getProfile(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('organization must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('returned organization must have correct id', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('id', organizationDataMock.id);
            });
        });

        describe('Get for user Method', () => {
            var req = mockRequest();
            req.query.userToken = "token";
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('organizations must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });

            it('returned organization must have correct id', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('id', organizationsForUserMock.id);
            });

            it('returned organizations must have role', async () => {
                var response = res.send.args[0][0];
                expect(response[0].userOrganizations).to.have.property('role');
            });
        });

        describe('Get all Method', () => {
            var req = mockRequest();
            req.query.userToken = null;
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('organizations must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });

            it('returned organization must have correct id', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('id', organizationDataMock.id);
            });

            it('returned organizations must not have role', async () => {
                var response = res.send.args[0][0];
                expect(response[0].userOrganizations).to.be.undefined;
            });
        });

        describe('Create Method', () => {
            var req = mockRequest({body: organizationCreateData});
            req.query.userToken = "token";
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.create(req, res);
            });

            it('response status must be 201', async () => {
                expect(res.status).to.have.been.calledWith(201);
            });

            it('organization must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('returned organization must have an id', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('id');
            });
        });

        describe('Update Method', () => {
            var req = mockRequest({body: organizationCreateData});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.updateProfile(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Invite Users Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.inviteUsers(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('response must be an array', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });
        });

        describe('Add user', () => {
            var req = mockRequest();
            var res;

            before(async () => {
                req.body.token = 'token';
            });

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.addUser(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Remove User', () => {
            var req = mockRequest();
            req.params.userId = 1;
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.removeUser(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Abandon User', () => {
            var req = mockRequest();
            req.params.userId = null;
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.removeUser(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Update User', () => {
            var req = mockRequest({body: {role: 'member'}});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.updateUser(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Delete Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.delete(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Get statistics Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.getStatistics(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('response body must have users count', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('usersCount', organizationUserCountMock);
            });

            it('response body must have messages count', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('messagesCount', organizationMessageCountMock);
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1, mock2, mock3, mock4, mock5, mock6, mock7, mock8, mock9, 
            mock10, mock11;

        before(async () => {
            TestPermissionsMock.allowPermissions();
            mock1 = stub(OrganizationDao, 'findById').rejects(TestException);
            mock2 = stub(OrganizationDao, 'create').rejects(TestException);
            mock3 = stub(OrganizationService, 'inviteUsers').rejects(TestException);
            mock4 = stub(UserService, 'findUserOrganizations').rejects(TestException);
            mock5 = stub(OrganizationService, 'acceptUserInvitation').rejects(TestException);
            mock6 = stub(OrganizationService, 'removeUser').rejects(TestException);
            mock7 = stub(OrganizationDao, 'get').rejects(TestException);
            mock8 = stub(OrganizationDao, 'delete').rejects(TestException);
            mock9 = stub(OrganizationService, 'getStatistics').rejects(TestException);
            mock10 = stub(UserRoleDao, 'updateUserRole').rejects(TestException);
            mock11 = stub(OrganizationDao, 'update').rejects(TestException);
        });

        after(async () => {
            TestPermissionsMock.restore();
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
            mock8.restore();
            mock9.restore();
            mock10.restore();
            mock11.restore();
        });


        describe('Get Profile Method with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.getProfile(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get for user Method with error', () => {
            var req = mockRequest();
            req.query.userToken = "token";
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.get(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get all Method with error', () => {
            var req = mockRequest();
            req.query.userToken = null;
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.get(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create Method', () => {
            var req = mockRequest({body: organizationCreateData});
            req.query.userToken = "token";
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.create(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Update Method', () => {
            var req = mockRequest({body: organizationCreateData});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.updateProfile(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Invite Users Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.inviteUsers(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must be an array', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Add user with error', () => {
            var req = mockRequest();
            req.body.id = "token";
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.addUser(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Remove user', () => {
            var req = mockRequest();
            req.params.userId = -1;
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.removeUser(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Update user', () => {
            var req = mockRequest({body: {role: 'member'}});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.updateUser(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });

            describe('Invalid role', () => {
                var req = mockRequest({body: {role: 'invalid'}});
                var res;

                beforeEach(async () => {
                    res = mockResponse();
                    await OrganizationsController.updateUser(req, res);
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

        describe('Delete Method with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.delete(req, res);
            });

            it('response status must be correct', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get statistics with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.getStatistics(req, res);
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

        describe('Delete Method with permission error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.delete(req, res);
            });

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Remove user with permission error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.userId = -1;
                res = mockResponse();
                await OrganizationsController.removeUser(req, res);
            });

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Update user Method with permission error', () => {
            var req = mockRequest({body: {role: 'member'}});
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.updateUser(req, res);
            });

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Update profile with permission error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.updateProfile(req, res);
            });

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create Method with permission error', () => {
            var req = mockRequest({body: organizationCreateData});
            req.query.userToken = null;
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.create(req, res);
            });

            it('response status must be 401', async () => {
                expect(res.status).to.have.been.calledWith(401);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Invite users with permission error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.inviteUsers(req, res);
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
