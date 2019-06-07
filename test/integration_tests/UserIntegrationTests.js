const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const request = require('supertest');
const app = require('../../src/app');
var { userCreateData } = require('../data/userData');
var IntegrationTestsHelper = require('./IntegrationTestsHelper');

describe('"User Integration Tests"', () => {
    var user, id, userToken;

    beforeEach(async () => {
        user = await IntegrationTestsHelper.createUser();
        id = user.id;
        userToken = user.token;
    });

    describe('User register', () => {
        it('should return user data', async () => {
            var user = userCreateData();
            var response = await request(app).post('/users').send(user);
            
            expect(response.status).to.eq(201);
            expect(response.body.id).to.be.above(0);
            expect(response.body.name).to.eq(user.name);
            expect(response.body.email).to.eq(user.email);
            expect(response.body.picture).to.eq(user.picture);
            expect(response.body.latitude).to.be.null;
            expect(response.body.longitude).to.be.null;
        });

        it('register with existing username fails', async () => {
            var user2 = userCreateData();

            user2.username = user.username;
            var response = await request(app).post('/users').send(user2);
            expect(response.status).to.eq(400);
            expect(response.body.error).to.not.eq('');
        });
    });

    describe('User profile', () => {
        it('should update user data', async () => {
            var updatedName = 'updated user name';
            user.name = updatedName;
            var response = await request(app).put(`/users?userToken=${userToken}`).send(user);
            expect(response.status).to.eq(204);

            var response = await request(app).get(`/users/profile?userToken=${userToken}`);
            expect(response.status).to.eq(200);
            expect(response.body.name).to.eq(updatedName);
        });

        it('should update user location', async () => {
            var location = { latitude: 1.231235, longitude: 8.4828492 };
            var response = await request(app).put(`/users/location?userToken=${userToken}`).send(location);
            expect(response.status).to.eq(204);

            var response = await request(app).get(`/users/profile?userToken=${userToken}`);
            expect(response.status).to.eq(200);
            expect(response.body.latitude).to.eq(location.latitude);
            expect(response.body.longitude).to.eq(location.longitude);
        });
    });
});