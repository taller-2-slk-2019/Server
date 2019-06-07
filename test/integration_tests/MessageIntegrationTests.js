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
var Firebase = require('../../src/firebase/FirebaseService');

describe('"Message Integration Tests"', () => {
    var firebaseMock;
    var user, organization, channel, message;

    before(() => {
        firebaseMock = stub(Firebase, 'sendMessage').resolves();
    });

    after(async () => {
        firebaseMock.restore();
    });

    beforeEach(async () => {
        user = await createUser();
        organization = await createOrganization(user);
        channel = await createChannel(organization, user);

        message = {
            data: "message",
            type: "text",
            channelId: channel.id
        }
    });

    describe('Message Creation', () => {
        it('should create text message', async () => {
            message.type = "text";
            var response = await request(app).post(`/messages?userToken=${user.token}`).send(message);
            expect(response.status).to.eq(201);
        });

        it('should create file message', async () => {
            message.type = "file";
            var response = await request(app).post(`/messages?userToken=${user.token}`).send(message);
            expect(response.status).to.eq(201);
        });

        it('should create image message', async () => {
            message.type = "image";
            var response = await request(app).post(`/messages?userToken=${user.token}`).send(message);
            expect(response.status).to.eq(201);
        });

        it('should create code message', async () => {
            message.type = "code";
            var response = await request(app).post(`/messages?userToken=${user.token}`).send(message);
            expect(response.status).to.eq(201);
        });

        it('should not create invalid message', async () => {
            message.type = "invalid";
            var response = await request(app).post(`/messages?userToken=${user.token}`).send(message);
            expect(response.status).to.eq(400);
        });
    });

    describe('Get Messages', () => {
        it('should return 25 last messages', async () => {
            var messagesNumber = 50;
            var messagesToReceive = 25;

            for (i = 0; i < messagesNumber; i++){
                message.data = "message" + i;
                var response = await request(app).post(`/messages?userToken=${user.token}`).send(message);
                expect(response.status).to.eq(201);
            }

            var response = await request(app).get(`/messages?channelId=${channel.id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(messagesToReceive);
            for (i = messagesToReceive; i < messagesNumber; i++){
                var msg = response.body.filter(m => m.data == "message" + i)[0];
                expect(msg).to.not.be.undefined;
            }
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

async function addUserToOrganization(organization, user, token){
    var response = await request(app).post(`/organizations/${organization.id}/invitations?userToken=${token}`)
                                     .send({userEmails: [user.email]});
    expect(response.status).to.eq(200);

    var response = await request(app).get(`/users/invitations?userToken=${user.token}`);
    expect(response.status).to.eq(200);
    var invitation = response.body[0];

    var response = await request(app).post(`/organizations/users`).send({token: invitation.token});
    expect(response.status).to.eq(204);
}

async function createChannel(organization, user){
    var channel = channelCreateData();
    channel.organizationId = organization.id;
    var response = await request(app).post(`/channels?userToken=${user.token}`).send(channel);
    expect(response.status).to.eq(201);
    return response.body;
}
