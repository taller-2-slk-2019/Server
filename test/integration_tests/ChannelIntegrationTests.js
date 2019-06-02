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
var { organizationCreateData } = require('../data/organizationData');
var { channelCreateData } = require('../data/channelData');

describe('"Channel Integration Tests"', () => {

    describe('Channel Creation', () => {
        it('should return channel data', async () => {
            var user = await createUser();
            var organization = await createOrganization(user);

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
            var user = await createUser();
            var organization = await createOrganization(user);

            var channel = channelCreateData();
            channel.organizationId = organization.id;
            var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(201);

            var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(400);
            expect(response.body.error).to.not.eq('');
        });
    });

    describe('Channel Update', () => {
        it('should return channel data', async () => {
            var user = await createUser();
            var organization = await createOrganization(user);

            var channel = channelCreateData();
            channel.organizationId = organization.id;
            var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(201);
            var id = response.body.id;

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
            var user = await createUser();
            var organization = await createOrganization(user);

            var channel = channelCreateData();
            channel.organizationId = organization.id;
            var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
            expect(response.status).to.eq(201);
            var id = response.body.id;

            var channel2 = channelCreateData();
            channel2.organizationId = organization.id;
            var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel2);
            expect(response.status).to.eq(201);

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
                users.push(await createUser());
            }
            var userToken = users[0].token;
            var organization = await createOrganization(users[0]);

            // Add users to organization
            for (i = 1; i < usersNumber; i++){
                var response = await request(app).post(`/organizations/${organization.id}/invitations?userToken=${userToken}`)
                                                 .send({userEmails: [users[i].email]});
                expect(response.status).to.eq(200);

                var response = await request(app).get(`/users/invitations?userToken=${users[i].token}`);
                expect(response.status).to.eq(200);
                var invitation = response.body[0];

                var response = await request(app).post(`/organizations/users`).send({token: invitation.token});
                expect(response.status).to.eq(204);
            }

            // Create channel
            var channel = channelCreateData();
            channel.organizationId = organization.id;
            var response = await request(app).post(`/channels?userToken=${userToken}`).send(channel);
            expect(response.status).to.eq(201);
            var id = response.body.id;

            // Add users
            for (i = 1; i < usersNumber; i++){
                var response = await request(app).post(`/channels/${id}/users?userToken=${userToken}`).send({userId: users[i].id});
                expect(response.status).to.eq(204);
            }

            // Delete last user
            var response = await request(app).delete(`/channels/${id}/users/${users[usersNumber - 1].id}?userToken=${userToken}`);
            expect(response.status).to.eq(204);

            // Get channel users
            var response = await request(app).get(`/channels/${id}/users`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(usersNumber - 1);

            for (i = 0; i < usersNumber - 1; i++){
                var user = response.body.filter((usr) => usr.id == users[i].id)[0];
                expect(user).to.not.be.undefined;
            }

            var user = response.body.filter((usr) => usr.id == users[usersNumber - 1].id)[0];
            expect(user).to.be.undefined;
        });
    });
});

async function createUser(){
    var user = userCreateData();
    var response = await request(app).post('/users').send(user);
    expect(response.status).to.eq(201);
    return response.body;
}

async function createOrganization(user){
    var organization = organizationCreateData;
    var response = await request(app).post(`/organizations?userToken=${user.token}`).send(organization);
    expect(response.status).to.eq(201);
    return response.body;
}