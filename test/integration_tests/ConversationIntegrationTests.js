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

describe('"Conversation Integration Tests"', () => {
    var user, user2, organization;

    beforeEach(async () => {
        user = await IntegrationTestsHelper.createUser();
        user2 = await IntegrationTestsHelper.createUser();
        organization = await IntegrationTestsHelper.createOrganization(user);
        await IntegrationTestsHelper.addUserToOrganization(organization, user2, user.token);
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
                var usr = await IntegrationTestsHelper.createUser();
                users.push(usr);
                await IntegrationTestsHelper.addUserToOrganization(organization, usr, user.token);
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
