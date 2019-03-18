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

        it('user surname and must be Perez', async () => {
            var response = res.send.args[0][0];
            expect(response).to.have.property('surname', "Perez");
        });

        it('user email and must be pepe@gmail.com', async () => {
            var response = res.send.args[0][0];
            expect(response).to.have.property('email', "pepe@gmail.com");
        });
    });

});