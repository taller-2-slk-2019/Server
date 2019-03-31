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

describe('"OrganizationsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;
        var mock5;
        var mock6;

        before(async () => {
            mock1 = stub(OrganizationDao, 'findById').resolves(organizationDataMock);
            mock2 = stub(OrganizationDao, 'create').resolves(organizationDataMock);
            mock3 = stub(OrganizationDao, 'inviteUser').resolves("token");
            mock4 = stub(OrganizationDao, 'findForUser').resolves([organizationsForUserMock, organizationsForUserMock]);
            mock5 = stub(OrganizationDao, 'acceptUserInvitation').resolves();
            mock6 = stub(OrganizationDao, 'removeUser').resolves();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
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

        describe('Invite User Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = 1;
                req.params.email = "mail";
                res = mockResponse();
                await OrganizationsController.inviteUser(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('must return a token', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property("token");
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

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have a success', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('success');
            });
        });

        describe('Remove User', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await OrganizationsController.removeUser(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have a success', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('success');
            });
        });
    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;
        var mock5;
        var mock6;

        before(async () => {
            mock1 = stub(OrganizationDao, 'findById').rejects();
            mock2 = stub(OrganizationDao, 'create').rejects();
            mock3 = stub(OrganizationDao, 'inviteUser').rejects();
            mock4 = stub(OrganizationDao, 'findForUser').rejects();
            mock5 = stub(OrganizationDao, 'acceptUserInvitation').rejects();
            mock6 = stub(OrganizationDao, 'removeUser').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
        });


        describe('Get Profile Method with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.getProfile(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get for user Method with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.get(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
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

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Invite User Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = 1;
                req.params.email = "mail";
                res = mockResponse();
                await OrganizationsController.inviteUser(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
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

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
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
