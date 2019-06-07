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

describe('"Conversation Integration Tests"', () => {
    var user, user2, organization;

    beforeEach(async () => {
        user = await createUser();
        user2 = await createUser();
        organization = await createOrganization(user);
        await addUserToOrganization(organization, user2, user.token);
    });

    describe('Conversation Creation', () => {
        it('should return conversation data', async () => {
            var conversation = {
                organizationId: organization.id,
                userId: user2.id
            }
            var response = await request(app).post(`/conversations?userToken=${user.token}`).send(conversation);
            expect(response.status).to.eq(201);

            expect(response.body.id).to.be.above(0);
            expect(response.body.users[0].id).to.eq(user2.id);
        });

        it('should return same conversation if already exists', async () => {
            var conversation = {
                organizationId: organization.id,
                userId: user2.id
            }
            var response = await request(app).post(`/conversations?userToken=${user.token}`).send(conversation);
            expect(response.status).to.eq(201);
            var id = response.body.id;

            var response = await request(app).post(`/conversations?userToken=${user.token}`).send(conversation);
            expect(response.status).to.eq(201);
            expect(response.body.id).to.eq(id);
        });
    });

    describe('Get conversations', () => {
        it('should get all conversations', async () => {
            var usersNumber = 10;
            var users = [];
            for (i = 0; i < usersNumber; i++){
                var usr = await createUser();
                users.push(usr);
                await addUserToOrganization(organization, usr, user.token);
            }

            // Create conversation with users
            for (i = 0; i < usersNumber; i++){
                var conversation = {
                    organizationId: organization.id,
                    userId: users[i].id
                }
                var response = await request(app).post(`/conversations?userToken=${user.token}`).send(conversation);
                expect(response.status).to.eq(201);
                expect(response.body.id).to.be.above(0);
                expect(response.body.users[0].id).to.eq(users[i].id);
            }

            // Get conversatoins
            var response = await request(app).get(`/conversations?userToken=${user.token}&organizationId=${organization.id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(usersNumber);

            for (i = 0; i < usersNumber; i++){
                var conversation = response.body.filter((conv) => conv.users[0].id == users[i].id)[0];
                expect(conversation).to.not.be.undefined;
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