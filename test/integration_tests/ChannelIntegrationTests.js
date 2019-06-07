const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const request = require('supertest');
const app = require('../../src/app');
var IntegrationTestsHelper = require('./IntegrationTestsHelper');
var { channelCreateData } = require('../data/channelData');

describe('"Channel Integration Tests"', () => {
    var user, organization, channel, userToken, id;

    beforeEach(async () => {
        user = await IntegrationTestsHelper.createUser();
        organization = await IntegrationTestsHelper.createOrganization(user);
        channel = await IntegrationTestsHelper.createChannel(organization, user);
        id = channel.id;
        userToken = user.token;
    });

    describe('Channel Creation', () => {
        it('should return channel data', async () => {
            var channel = channelCreateData();
            channel.organizationId = organization.id;
            var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(201);

            expect(response.body.id).to.be.above(0);
            expect(response.body.name).to.eq(channel.name);
            expect(response.body.description).to.eq(channel.description);
            expect(response.body.welcome).to.eq(channel.welcome);
            expect(response.body.isPublic).to.eq(channel.isPublic);
        });

        it('should fail if channel name exists', async () => {
            var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(400);
            expect(response.body.error).to.not.eq('');
        });
    });

    describe('Channel Update', () => {
        it('should return channel data', async () => {
            var updatedName = "new channel name";
            channel.name = updatedName;
            var response = await request(app).put(`/channels/${id}?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(204);

            var response = await request(app).get(`/channels/${id}`);
            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(id);
            expect(response.body.name).to.eq(updatedName);
        });

        it('should fail if channel name exists', async () => {
            var channel2 = await IntegrationTestsHelper.createChannel(organization, user);

            channel.name = channel2.name;
            var response = await request(app).put(`/channels/${id}?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(400);
            expect(response.body.error).to.not.eq('');
        });
    });

    describe('Channel Users', () => {
        it('should add users, remove and return them', async () => {
            var usersNumber = 10;

            var users = [];
            for (i = 0; i < usersNumber; i++){
                users.push(await IntegrationTestsHelper.createUser());
            }

            // Add users to organization
            for (i = 0; i < usersNumber; i++){
                await IntegrationTestsHelper.addUserToOrganization(organization, users[i], userToken);
            }

            // Add users to channel
            for (i = 0; i < usersNumber; i++){
                var response = await request(app).post(`/channels/${id}/users?userToken=${userToken}`).send({userId: users[i].id});
                expect(response.status).to.eq(204);
            }

            // Delete last user
            var response = await request(app).delete(`/channels/${id}/users/${users[usersNumber - 1].id}?userToken=${userToken}`);
            expect(response.status).to.eq(204);

            // Get channel users
            var response = await request(app).get(`/channels/${id}/users`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(usersNumber);

            for (i = 0; i < usersNumber - 1; i++){
                var user = response.body.filter((usr) => usr.id == users[i].id)[0];
                expect(user).to.not.be.undefined;
            }

            var user = response.body.filter((usr) => usr.id == users[usersNumber - 1].id)[0];
            expect(user).to.be.undefined;
        });
    });
});
