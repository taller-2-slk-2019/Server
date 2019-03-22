const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');
const userProfileMock = require('../mocks/userProfileMock');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var UserController = require('../../src/controllers/UsersController');
var models = require('../../src/database/sequelize');
var User = models.user;
var UserDao = require('../../src/daos/UserDao');
var {UserNotFoundError } = require('../../src/helpers/Errors');

describe('"UserController Tests"', () => {

    describe('Methods without errors', () => {
        var mock1;
        var mock2;
        var mock3;

        before(async () => {
            mock1 = stub(UserDao, 'create').resolves(userProfileMock);
            mock2 = stub(UserDao, 'update').resolves();
            mock3 = stub(UserDao, 'findById').resolves(userProfileMock);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });

        describe('Register User', () => {

            var data = {name: "Pepe", surname: "Perez", email:"pepe@gmail.com"};
            var req = mockRequest({ body: data });
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
                expect(response).to.have.property('name', "Pepe");
            });

            it('user surname must be Perez', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('surname', "Perez");
            });

            it('user email must be pepe@gmail.com', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('email', "pepe@gmail.com");
            });
        });

        describe('Get Profile', () => {
            var req = mockRequest({});
            var res;

            before(async () => {
                req.params.id = userProfileMock.id;
            });

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
                expect(response).to.have.property('id', req.params.id);
            });
            
            it('user name must be Pepe', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('name', "Pepe");
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

            it('response status must be 200', async () => {
                expect(res.status).to.have.been.calledWith(200);
            });
            
            it('response must have a success', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('success');
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

        before(async () => {
            mock1 = stub(UserDao, 'create').rejects(SequelizeValidationError);
            mock2 = stub(UserDao, 'update').rejects(SequelizeValidationError);
            mock3 = stub(UserDao, 'findById').rejects(UserNotFoundError);
        });

        after(async () => {
            mock1.restore();
            mock2.restore();
            mock3.restore();
        });


        describe('Register User with error', () => {

            var data = {name: "Pepe"};
            var req = mockRequest({ body: data });
            var res;

            beforeEach(async () => {
                res = mockResponse();
                await UserController.register(req, res);
            });

            it('response status must be 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('response must have an error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property('error');
            });
        });
    
    
        describe('Get Profile with error', () => {

            var req = mockRequest();
            var res;
            req.params.id = 9999999
            
            beforeEach(async () => {
                res = mockResponse();
                await UserController.getProfile(req, res);
            });

            it('response status must be 500', async () => { 
                expect(res.status).to.have.been.calledWith(500);
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

            it('response status must be 500', async () => { 
                expect(res.status).to.have.been.calledWith(500);
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
                    expect(res.status).to.have.been.calledWith(500);
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
                    expect(res.status).to.have.been.calledWith(500);
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
                    expect(res.status).to.have.been.calledWith(500);
                });

                it('response must have an error', async () => {
                    var response = res.send.args[0][0];
                    expect(response).to.have.property('error');
                });
            });

        });
    });
});
