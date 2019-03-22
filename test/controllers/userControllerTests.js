const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');

var UserController = require('../../src/controllers/UsersController');
var models = require('../../src/database/sequelize');
var User = models.user;
var {UserNotFoundError } = require('../../src/helpers/Errors');

describe('"UserController Tests"', () => {

    describe('Method: Register User', () => {

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

    describe('Method: Register User with error', () => {

        var data = {name: "Pepe"};
        var req = mockRequest({ body: data });
        var res;
        var expected;

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
    
    describe('Method: Get Profile', () => {

        var req = mockRequest({});
        var res;
        var expected;

        before(async () => {
            var data = {name: "Pepe", surname: "Perez", email:"pepe@gmail.com", picture: "default"};
            var user = await User.create(data);
            req.params.id = user.id;
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
    
    describe('Method: Get Profile with error', () => {

        var req = mockRequest();
        var res;
        req.params.id = 9999999
        var expected;

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
    
    describe('Method: Update Profile', () => {

        var changes = {name: "Pepe", surname: "Rodriguez", email:"pepe_rodriguez@gmail.com", picture: 'default'}
        var req = mockRequest({ body: changes });
        var res;
        var id;
        var expected;
        
        before(async () => {
            var data = {name: "Juan", surname: "Rodriguez", email:"juan_rodriguez@gmail.com", picture: "default"}
            var user = await User.create(data);
            req.params.id = user.id;
            id = user.id;
        });

        beforeEach(async () => {
            res = mockResponse();
            await UserController.updateProfile(req, res);
        });

        it('response status must be 200', async () => {
            expect(res.status).to.have.been.calledWith(200);
        });
        
        it('user name must be Pepe', async () => {
            var updated_user = await User.findByPk(id);
            expect(updated_user).to.have.property('name', "Pepe");
        });
        
        it('user surname and must be Rodriguez', async () => {
            var updated_user = await User.findByPk(id);
            expect(updated_user).to.have.property('surname', "Rodriguez");
        });

        it('user email and must be pepe_rodriguez@gmail.com', async () => {
            var updated_user = await User.findByPk(id);
            expect(updated_user).to.have.property('email', "pepe_rodriguez@gmail.com");
        });
    });

    describe('Method: Update Profile with error', () => {

        var req = mockRequest();
        var res;
        req.params.id = 9999999;
        var expected;

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

    describe('Method: Update Location', () => {

        var changes = {latitude: 1.234, longitude: 2.128}
        var req = mockRequest({ body: changes });
        var res;
        var id;
        var expected;
        
        before(async () => {
            var data = {name: "Juan", surname: "Rodriguez", email:"juan_rodriguez@gmail.com", picture: "default"}
            var user = await User.create(data);
            req.params.id = user.id;
            id = user.id;
        });

        beforeEach(async () => {
            res = mockResponse();
            await UserController.updateLocation(req, res);
        });

        it('response status must be 200', async () => {
            expect(res.status).to.have.been.calledWith(200);
        });
        
        it('user latitude must be 1.234', async () => {
            var updated_user = await User.findByPk(id);
            expect(updated_user.latitude).to.equal(1.234);
        });
        
        it('user longitude and must be 2.128', async () => {
            var updated_user = await User.findByPk(id);
            expect(updated_user.longitude).to.equal(2.128);
        });
    });
});
