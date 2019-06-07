const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const request = require('supertest');
const app = require('../../src/app');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');
var { channelCreateData } = require('../data/channelData');

class IntegrationTestsHelper {

    async createUser(){
        var user = userCreateData();
        var response = await request(app).post('/users').send(user);
        expect(response.status).to.eq(201);
        return response.body;
    }

    async createOrganization(user){
        var organization = organizationCreateData;
        var response = await request(app).post(`/organizations?userToken=${user.token}`).send(organization);
        expect(response.status).to.eq(201);
        return response.body;
    }

    async addUserToOrganization(organization, user, token){
        var response = await request(app).post(`/organizations/${organization.id}/invitations?userToken=${token}`)
                                         .send({userEmails: [user.email]});
        expect(response.status).to.eq(200);

        var response = await request(app).get(`/users/invitations?userToken=${user.token}`);
        expect(response.status).to.eq(200);
        var invitation = response.body[0];

        var response = await request(app).post(`/organizations/users`).send({token: invitation.token});
        expect(response.status).to.eq(204);
    }

    async createChannel(organization, user){
        var channel = channelCreateData();
        channel.organizationId = organization.id;
        var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
        expect(response.status).to.eq(201);
        return response.body;
    }
}

module.exports = new IntegrationTestsHelper();
