const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');

var Response = require('../../src/helpers/Response');
var TestException = require('../TestException');
var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.ValidationError;

describe('"Response Tests"', () => {

    describe('Send success response', () => {
        var res;
        var data = {user: "pepe"};

        beforeEach(async () => {
            res = mockResponse();
            Response.sendSuccessResponse(res, data);
        });

        it('should have status 200', async () => {
            expect(res.status).to.have.been.calledWith(200);
        });

        it('should have correct data', async () => {
            var response = res.send.args[0][0];
            expect(response).to.eq(data);
        });
    });

    describe('Send success created response', () => {
        var res;
        var data = {user: "pepe"};

        beforeEach(async () => {
            res = mockResponse();
            Response.sendSuccessCreatedResponse(res, data);
        });

        it('should have status 201', async () => {
            expect(res.status).to.have.been.calledWith(201);
        });

        it('should have correct data', async () => {
            var response = res.send.args[0][0];
            expect(response).to.eq(data);
        });
    });

    describe('Send empty success response', () => {
        var res;

        beforeEach(async () => {
            res = mockResponse();
            Response.sendEmptySuccessResponse(res);
        });

        it('should have status 204', async () => {
            expect(res.status).to.have.been.calledWith(204);
        });

        it('should have correct data', async () => {
            var response = res.send.args[0][0];
            expect(response).to.be.undefined;
        });
    });

    describe('Send error response', () => {
        var res;

        describe('Hypechat error', () => {
            beforeEach(async () => {
                res = mockResponse();
                Response.sendErrorResponse(res, TestException);
            });

            it('should have correct status', async () => {
                expect(res.status).to.have.been.calledWith(TestException.errorCode);
            });

            it('should have error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property("error", TestException.message);
            });
        });

        describe('Sequelize error', () => {
            beforeEach(async () => {
                res = mockResponse();
                Response.sendErrorResponse(res, new SequelizeValidationError());
            });

            it('should have status 400', async () => {
                expect(res.status).to.have.been.calledWith(400);
            });

            it('should have error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property("error");
            });
        });

        describe('Unknown error', () => {
            beforeEach(async () => {
                res = mockResponse();
                Response.sendErrorResponse(res, new Error());
            });

            it('should have status 500', async () => {
                expect(res.status).to.have.been.calledWith(500);
            });

            it('should have error', async () => {
                var response = res.send.args[0][0];
                expect(response).to.have.property("error");
            });
        });
    });
});