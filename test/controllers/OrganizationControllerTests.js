const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const organizationDataMock = require('../mocks/organizationDataMock');
const organizationsForUserMock = require('../mocks/organizationsForUserMock');
const { organizationCreateData } = require('../data/organizationData');

var OrganizationsController = require('../../src/controllers/OrganizationsController');
var OrganizationDao = require('../../src/daos/OrganizationDao');
var AdminDao = require('../../src/daos/AdminUserDao');
const adminMock = require('../mocks/adminMock');

describe('"OrganizationsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1, mock2, mock3, mock4, mock5, mock6, mock7, mock8, mock9;

        before(async () => {
            mock1 = stub(OrganizationDao, 'findById').resolves(organizationDataMock);
            mock2 = stub(OrganizationDao, 'create').resolves(organizationDataMock);
            mock3 = stub(OrganizationDao, 'inviteUsers').resolves(["mail1", "mail2"]);
            mock4 = stub(OrganizationDao, 'findForUser').resolves([organizationsForUserMock, organizationsForUserMock]);
            mock5 = stub(OrganizationDao, 'acceptUserInvitation').resolves();
            mock6 = stub(OrganizationDao, 'removeUser').resolves();
            mock7 = stub(OrganizationDao, 'get').resolves([organizationDataMock, organizationDataMock]);
            mock8 = stub(OrganizationDao, 'delete').resolves();
            mock9 = stub(AdminDao, 'findByToken').resolves(adminMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
            mock8.restore();
            mock9.restore();
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
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.create(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
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
    });

    describe('Methods with errors', () => {
        var mock1, mock2, mock3, mock4, mock5, mock6, mock7, mock8, mock9;

        before(async () => {
            mock1 = stub(OrganizationDao, 'findById').rejects();
            mock2 = stub(OrganizationDao, 'create').rejects();
            mock3 = stub(OrganizationDao, 'inviteUsers').rejects();
            mock4 = stub(OrganizationDao, 'findForUser').rejects();
            mock5 = stub(OrganizationDao, 'acceptUserInvitation').rejects();
            mock6 = stub(OrganizationDao, 'removeUser').rejects();
            mock7 = stub(OrganizationDao, 'get').rejects();
            mock8 = stub(OrganizationDao, 'delete').rejects();
            mock9 = stub(AdminDao, 'findByToken').resolves(adminMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
            mock8.restore();
            mock9.restore();
        });


        describe('Get Profile Method with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.getProfile(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Create Method', () => {
            var req = mockRequest({body: organizationCreateData});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.create(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Remove user', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.removeUser(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
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

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    });

    describe('Methods with admin errors', () => {
        var mock1, mock2;

        before(async () => {
            mock1 = stub(OrganizationDao, 'delete').rejects();
            mock2 = stub(AdminDao, 'findByToken').resolves(adminMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
        });

        describe('Delete Method with admin error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.delete(req, res);
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
