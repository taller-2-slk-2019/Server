const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const request = require('supertest');
const app = require('../../src/app');

describe('"App Tests"', () => {

    describe('Invalid request', () => {
        it('should return 404', async () => {
            var response = await request(app)
                                .get('/invalid');
            
            expect(response.status).to.eq(404);
        });

        it('should return invalid message', async () => {
            var response = await request(app)
                                .get('/invalid');
            
            expect(response.text).to.eq('Invalid Api');
        });
    });
});
