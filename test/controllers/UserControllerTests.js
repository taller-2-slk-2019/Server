const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const userProfileMock = require('../mocks/userProfileMock');
const userForOrganizationMock = require('../mocks/userForOrganizationMock');
const userOrganizationInvitationMock = require('../mocks/userOrganizationInvitationMock');
const { userCreateData } = require('../data/userData');

var UserController = require('../../src/controllers/UsersController');
var UserDao = require('../../src/daos/UserDao');
var OrganizationDao = require('../../src/daos/OrganizationDao');
var UserStatistics = require('../../src/models/statistics/UserStatistics')
var UserService = require('../../src/services/UserService')

describe('"UsersController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;
        var mock4;
        var mock5;
        var mock6;
        var mock7;

        before(async () => {
            mock1 = stub(UserDao, 'create').resolves(userProfileMock);
            mock2 = stub(UserDao, 'update').resolves();
            mock3 = stub(UserDao, 'findById').resolves(userProfileMock);
            mock4 = stub(OrganizationDao, 'findOrganizationUsers').resolves([userForOrganizationMock, userForOrganizationMock]);
            mock5 = stub(UserDao, 'findByToken').resolves(userProfileMock);
            mock6 = stub(UserDao, 'findUserInvitations').resolves([userOrganizationInvitationMock, userOrganizationInvitationMock]);
            mock7 = stub(UserDao, 'deleteUserInvitation').resolves();
            mock8 = stub(UserService, 'getStatistics').resolves(new UserStatistics(['org1'], 2));
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
        });

        describe('Register User', () => {
            var req = mockRequest({ body: userCreateData() });
            var res;
            var expected;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.register(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('user must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('user name must be Pepe', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('name', req.body.name);
            });

            it('user email must be pepe@gmail.com', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('email', req.body.email);
            });
        });

        describe('Register User without username', () => {
            var req = mockRequest({ body: userCreateData() });
            var res;
            var expected;
            var mock;

            before(async() => {
                mock = stub(UserDao, 'usernameExists').resolves(false);
            });

            after(async() => {
                mock.restore();
            });

            beforeEach(async () => {
                req.body.username = null;
                res = mockResponse();
            });

            it('response status must be 200', async () => {
                await UserController.register(req, res);
                expect(res.status).to.have.been.calledWith(200);
            });

            it('user must not be null', async () => {
                await UserController.register(req, res);
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('must not fail if generated username not exists', async () => {
                await UserController.register(req, res);
                var response = res.send.args[0][0];
                expect(res.status).to.have.been.calledWith(200);
            });

            it('must not fail if generated username exists', async () => {
                mock.restore();
                mock = stub(UserDao, 'usernameExists').resolves(true);
                await UserController.register(req, res);
                var response = res.send.args[0][0];
                expect(res.status).to.have.been.calledWith(200);
            });
        });

        describe('Get Profile', () => {
            var req = mockRequest({});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.getProfile(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('user must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('user id must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('id', userProfileMock.id);
            });

            it('user must not have token', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.have.property('token');
            });
        });

        describe('Get User', () => {
            var req = mockRequest({});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.getUser(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('user must not be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.be.null;
            });

            it('user id must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('id', userProfileMock.id);
            });

            it('user must not have token', async () => {
                var response = res.send.args[0][0];
                expect(response).to.not.have.property('token');
            });
        });

        describe('Get', () => {
            var req = mockRequest({});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.get(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have users', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });

            it('user id must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('id', userForOrganizationMock.id);
            });

            it('users must have role', async () => {
                var response = res.send.args[0][0];
                expect(response[0].userOrganizations).to.have.property('role');
            });
        });

        describe('Update Profile', () => {
            var changes = {name: "Pepe", surname: "Rodriguez", email:"pepe_rodriguez@gmail.com", picture: 'default'}
            var req = mockRequest({ body: changes });
            var res;

            before(async () => {
                req.params.id = userProfileMock.id;
            });

            beforeEach(async () => {
                res = mockResponse();
                await UserController.updateProfile(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Update Location', () => {

            var changes = {latitude: 1.234, longitude: 2.128}
            var req = mockRequest({ body: changes });
            var res;
            
            before(async () => {
                req.params.id = userProfileMock.id;
            });

            beforeEach(async () => {
                res = mockResponse();
                await UserController.updateLocation(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Get invitations', () => {
            var req = mockRequest({});
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.getInvitations(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have invitations', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.an('array');
            });

            it('invitation token must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response[0]).to.have.property('token', userOrganizationInvitationMock.organizationUserInvitation.token);
            });

            it('invitation organization must be correct', async () => {
                var response = res.send.args[0][0];
                expect(response[0].organization.name).to.eq(userOrganizationInvitationMock.name);
            });
        });

        describe('Delete invitation', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.deleteInvitation(req, res);
            });

            it('response status must be 204', async () => {
                expect(res.status).to.have.been.calledWith(204);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response).to.be.undefined;
            });
        });

        describe('Get statistics', () => {
            var req = mockRequest();
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.getStatistics(req, res);
            });

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });

            it('response body must be null', async () => {
                var response = res.send.args[0][0];
                expect(response.messagesSent).to.eq(2);
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
        var mock7;

        before(async () => {
            mock1 = stub(UserDao, 'create').rejects();
            mock2 = stub(UserDao, 'update').rejects();
            mock3 = stub(UserDao, 'findById').rejects();
            mock4 = stub(OrganizationDao, 'findOrganizationUsers').rejects();
            mock5 = stub(UserDao, 'findByToken').rejects();
            mock6 = stub(UserDao, 'findUserInvitations').rejects();
            mock7 = stub(UserDao, 'deleteUserInvitation').rejects();
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
            mock4.restore();
            mock5.restore();
            mock6.restore();
            mock7.restore();
        });


        describe('Register User with error', () => {

            var data = {name: "Pepe"};
            var req = mockRequest({ body: data });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.register(req, res);
            });

            it('response status must be 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    
    
        describe('Get Profile with error', () => {

            var req = mockRequest();
            var res;
            
            beforeEach(async () => {
                res = mockResponse();
                await UserController.getProfile(req, res);
            });

            it('response status must be 400', async () => { 
                expect(res.status).to.have.been.calledWith(400);
            });
            
            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get User with error', () => {

            var req = mockRequest();
            var res;
            req.params.id = 9999999
            
            beforeEach(async () => {
                res = mockResponse();
                await UserController.getUser(req, res);
            });

            it('response status must be 400', async () => { 
                expect(res.status).to.have.been.calledWith(400);
            });
            
            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Get with error', () => {

            var req = mockRequest();
            var res;
            
            beforeEach(async () => {
                res = mockResponse();
                await UserController.get(req, res);
            });

            it('response status must be 400', async () => { 
                expect(res.status).to.have.been.calledWith(400);
            });
            
            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    

        describe('Update Profile with error', () => {

            var req = mockRequest();
            var res;
            req.params.id = 9999999;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.updateProfile(req, res);
            });

            it('response status must be 400', async () => { 
                expect(res.status).to.have.been.calledWith(400);
            });
            
            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Update Location with Error', () => {
            describe('Update only latitude', () => {
                var res;
                var req;

                before(async () => {
                    var changes = {latitude: 1.234}
                    req = mockRequest({ body: changes });
                    req.params.id = userProfileMock.id;
                });

                beforeEach(async () => {
                    res = mockResponse();
                    await UserController.updateLocation(req, res);
                });

                it('can not update location', async () => {
                    expect(res.status).to.have.been.calledWith(400);
                });

                it('response must have an error', async () => {
                    var response = res.send.args[0][0];
                    expect(response).to.have.property('error');
                });
            });

            describe('Update only longitude', () => {
                var res;
                var req;

                before(async () => {
                    var changes = {longitude: 1.234}
                    req = mockRequest({ body: changes });
                    req.params.id = userProfileMock.id;
                });

                beforeEach(async () => {
                    res = mockResponse();
                    await UserController.updateLocation(req, res);
                });

                it('can not update location', async () => {
                    expect(res.status).to.have.been.calledWith(400);
                });

                it('response must have an error', async () => {
                    var response = res.send.args[0][0];
                    expect(response).to.have.property('error');
                });
            });

            describe('Update with empty object', () => {
                var res;
                var req;

                before(async () => {
                    var changes = {}
                    req = mockRequest({ body: changes });
                    req.params.id = userProfileMock.id;
                });

                beforeEach(async () => {
                    res = mockResponse();
                    await UserController.updateLocation(req, res);
                });

                it('can not update location', async () => {
                    expect(res.status).to.have.been.calledWith(400);
                });

                it('response must have an error', async () => {
                    var response = res.send.args[0][0];
                    expect(response).to.have.property('error');
                });
            });

            describe('Update with both latitude and longitude', () => {
                var res;
                var req;

                before(async () => {
                    var changes = {latitude: 123.45, longitude: 123.45}
                    req = mockRequest({ body: changes });
                    req.params.id = userProfileMock.id;
                });

                beforeEach(async () => {
                    res = mockResponse();
                    await UserController.updateLocation(req, res);
                });

                it('can not update location', async () => {
                    expect(res.status).to.have.been.calledWith(400);
                });

                it('response must have an error', async () => {
                    var response = res.send.args[0][0];
                    expect(response).to.have.property('error');
                });
            });
        });

        describe('Get invitations', () => {

            var req = mockRequest();
            var res;
            
            beforeEach(async () => {
                res = mockResponse();
                await UserController.getInvitations(req, res);
            });

            it('response status must be 400', async () => { 
                expect(res.status).to.have.been.calledWith(400);
            });
            
            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });

        describe('Delete invitation', () => {

            var req = mockRequest();
            var res;
            
            beforeEach(async () => {
                res = mockResponse();
                await UserController.deleteInvitation(req, res);
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
