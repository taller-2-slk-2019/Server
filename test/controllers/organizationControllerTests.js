const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const organizationDataMock = require('../mocks/organizationDataMock');
const organizationProfileMock = require('../mocks/organizationProfileMock');
const { organizationCreateData } = require('../data/organizationData');

var OrganizationsController = require('../../src/controllers/OrganizationsController');
var OrganizationDao = require('../../src/daos/OrganizationDao');
/*
describe('"OrganizationsController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;

        before(async () => {
            mock1 = stub(OrganizationDao, 'findById').resolves(organizationProfileMock);
            mock2 = stub(OrganizationDao, 'create').resolves(organizationDataMock);
            mock3 = stub(OrganizationDao, 'inviteUser').resolves("token");
            mock4 = stub(OrganizationDao, 'findProfileForUser').resolves(organizationProfileMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
        });

        describe('Get Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = organizationProfileMock.id;
                res = mockResponse();
                await OrganizationsController.get(req, res);
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
                expect(response).to.have.property('id', organizationProfileMock.id);
            });

            it('returned organization must have users', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('users').with.length(organizationProfileMock.users.length);
            });

            it('returned users must have role', async () => {
                var response = res.send.args[0][0];
                expect(response.users[0].userOrganizations).to.have.property('role');
            });
        });

        describe('Get Profile for user Method', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = organizationProfileMock.id;
                res = mockResponse();
                await OrganizationsController.getProfileForUser(req, res);
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
                expect(response).to.have.property('id', organizationProfileMock.id);
            });

            it('returned organization must have users', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('users').with.length(organizationProfileMock.users.length);
            });

            it('returned users must have role', async () => {
                var response = res.send.args[0][0];
                expect(response.users[0].userOrganizations).to.have.property('role');
            });

            it('returned organization must have channels', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('userChannels').with.length(organizationProfileMock.userChannels.length);
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
    });

    describe('Methods with errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;

        before(async () => {
            mock1 = stub(OrganizationDao, 'findById').rejects();
            mock2 = stub(OrganizationDao, 'create').rejects();
            mock3 = stub(OrganizationDao, 'inviteUser').rejects();
            mock4 = stub(OrganizationDao, 'findProfileForUser').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
        });


        describe('Get Method with error', () => {
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

        describe('Get Profile for user Method with error', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                req.params.id = -1;
                res = mockResponse();
                await OrganizationsController.getProfileForUser(req, res);
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
    });
});
*/