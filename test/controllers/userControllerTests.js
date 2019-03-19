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
var User = models.User;

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

});
