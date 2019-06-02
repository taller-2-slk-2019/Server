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

describe('"Organization Integration Tests"', () => {

    describe('Organization Creation', () => {
        it('should return organization data', async () => {
            var user = await createUser();
            var userToken = user.token;

            var organization = organizationCreateData;
            var response = await request(app).post(`/organizations?userToken=${userToken}`).send(organization);
            expect(response.status).to.eq(201);

            expect(response.body.id).to.be.above(0);
            expect(response.body.name).to.eq(organization.name);
            expect(response.body.description).to.eq(organization.description);
            expect(response.body.welcome).to.eq(organization.welcome);
            expect(response.body.picture).to.eq(organization.picture);
            expect(response.body.latitude).to.eq(organization.latitude);
            expect(response.body.longitude).to.eq(organization.longitude);
        });
    });

    describe('Organization Update Profile', () => {
        it('should update organization data', async () => {
            var user = await createUser();
            var userToken = user.token;

            var organization = organizationCreateData;
            var response = await request(app).post(`/organizations?userToken=${userToken}`).send(organization);
            expect(response.status).to.eq(201);
            var id = response.body.id;

            var updatedWelcome = 'new welcome for the organization test';
            organization.welcome = updatedWelcome;

            var response = await request(app).put(`/organizations/${id}?userToken=${userToken}`).send(organization);
            expect(response.status).to.eq(204);

            var response = await request(app).get(`/organizations/${id}`);
            expect(response.status).to.eq(200);

            expect(response.body.id).to.eq(id);
            expect(response.body.welcome).to.eq(updatedWelcome);
        });
    });

    describe('Organization Users', () => {
        it('should invite users, change roles and return them', async () => {
            var usersNumber = 10;
            var users = [];
            for (i = 0; i < usersNumber; i++){
                users.push(await createUser());
            }
            var userCreatorToken = users[0].token;

            // Create organization
            var organization = organizationCreateData;
            var response = await request(app).post(`/organizations?userToken=${userCreatorToken}`).send(organization);
            expect(response.status).to.eq(201);
            var id = response.body.id;

            // Invite users
            var emails = users.map((user) => user.email).slice(1);
            var response = await request(app).post(`/organizations/${id}/invitations?userToken=${userCreatorToken}`).send({userEmails: emails});
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(0);

            // Accept user invitations
            for (i = 1; i < usersNumber; i++){
                var response = await request(app).get(`/users/invitations?userToken=${users[i].token}`);
                expect(response.status).to.eq(200);

                var invitation = response.body[0];
                expect(invitation.organization.id).to.eq(id);

                var response = await request(app).post(`/organizations/users`).send({token: invitation.token});
                expect(response.status).to.eq(204);
            }

            // Change role of second user
            var response = await request(app).put(`/organizations/${id}/users/${users[1].id}?userToken=${userCreatorToken}`).send({role: 'moderator'});
            expect(response.status).to.eq(204);

            // Get organization users
            var response = await request(app).get(`/users?organizationId=${id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(usersNumber);

            for (i = 0; i < usersNumber; i++){
                var user = response.body.filter((usr) => usr.id == users[i].id)[0];
                var expectedRole = i == 0 ? 'creator' : i == 1 ? 'moderator' : 'member';
                expect(user.userOrganizations.role).to.eq(expectedRole);
            }
        });
    });

    describe('Reject user invitation', () => {
        it('user should not belong to organization', async () => {
            var user = await createUser();
            var user2 = await createUser();
            var userCreatorToken = user.token;

            // Create organization
            var organization = organizationCreateData;
            var response = await request(app).post(`/organizations?userToken=${userCreatorToken}`).send(organization);
            expect(response.status).to.eq(201);
            var id = response.body.id;

            // Invite user2
            var response = await request(app).post(`/organizations/${id}/invitations?userToken=${userCreatorToken}`).send({userEmails: [user2.email]});
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(0);

            // Delete user2 invitation
            var response = await request(app).get(`/users/invitations?userToken=${user2.token}`);
            expect(response.status).to.eq(200);

            var invitation = response.body[0];
            expect(invitation.organization.id).to.eq(id);

            var response = await request(app).delete(`/users/invitations/${invitation.token}`);
            expect(response.status).to.eq(204);

            var response = await request(app).get(`/users/invitations?userToken=${user2.token}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(0);

            // Get organization users
            var response = await request(app).get(`/users?organizationId=${id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(1);
        });
    });

    describe('Remove user from organization', () => {
        it('should not belong to organization', async () => {
            var user = await createUser();
            var user2 = await createUser();
            var userCreatorToken = user.token;

            // Create organization
            var organization = organizationCreateData;
            var response = await request(app).post(`/organizations?userToken=${userCreatorToken}`).send(organization);
            expect(response.status).to.eq(201);
            var id = response.body.id;

            // Invite user2
            var response = await request(app).post(`/organizations/${id}/invitations?userToken=${userCreatorToken}`).send({userEmails: [user2.email]});
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(0);

            // Accept user2 invitation
            var response = await request(app).get(`/users/invitations?userToken=${user2.token}`);
            expect(response.status).to.eq(200);

            var invitation = response.body[0];
            expect(invitation.organization.id).to.eq(id);

            var response = await request(app).post(`/organizations/users`).send({token: invitation.token});
            expect(response.status).to.eq(204);

            // Remove user
            var response = await request(app).delete(`/organizations/${id}/users/${user2.id}?userToken=${userCreatorToken}`);
            expect(response.status).to.eq(204);

            // Get organization users
            var response = await request(app).get(`/users?organizationId=${id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(1);
        });
    });

    describe('Get all organization', () => {
        it('should return organizations data', async () => {
            var user = await createUser();
            var userCreatorToken = user.token;

            // Create organization
            var organizationsNumber = 10;
            var organizations = [];
            for (i = 0; i < organizationsNumber; i++){
                var organization = organizationCreateData;
                var response = await request(app).post(`/organizations?userToken=${userCreatorToken}`).send(organization);
                expect(response.status).to.eq(201);
                organizations.push(response.body);
            }

            // Delete last organization
            var response = await request(app).delete(`/organizations/${organizations[organizationsNumber - 1].id}?userToken=${userCreatorToken}`);
            expect(response.status).to.eq(204);

            // Get organizations
            var response = await request(app).get(`/organizations?userToken=${userCreatorToken}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(organizationsNumber - 1);
        });
    });
});

async function createUser(){
    var user = userCreateData();
    var response = await request(app).post('/users').send(user);
    expect(response.status).to.eq(201);
    return response.body;
}