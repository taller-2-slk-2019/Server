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

describe('"Bot Integration Tests"', () => {
    var user, organization, bot;

    beforeEach(async () => {
        admin = await IntegrationTestsHelper.createAdmin();
        user = await IntegrationTestsHelper.createUser();
        organization = await IntegrationTestsHelper.createOrganization(user);
        bot = {
            organizationId: organization.id,
            url: 'bot.com',
            name: 'bot'
        }
    });

    describe('Bot Creation', () => {
        it('should return bot data', async () => {
            var response = await request(app).post(`/bots?adminToken=${admin.token}`).send(bot);
            expect(response.status).to.eq(201);

            expect(response.body.id).to.be.above(0);
            expect(response.body.url).to.eq(bot.url);
            expect(response.body.name).to.eq(bot.name);
        });

        it('should not create repeated bot', async () => {
            var response = await request(app).post(`/bots?adminToken=${admin.token}`).send(bot);
            expect(response.status).to.eq(201);

            var response = await request(app).post(`/bots?adminToken=${admin.token}`).send(bot);
            expect(response.status).to.eq(400);
        });

        it('should not create tito bot', async () => {
            var tito = bot;
            tito.name = 'tito';
            var response = await request(app).post(`/bots?adminToken=${admin.token}`).send(tito);
            expect(response.status).to.eq(400);
        });
    });

    describe('Get bots', () => {
        it('should get all bots', async () => {
            var botsNumber = 10;
            bot = {
                organizationId: organization.id,
                url: 'bot.com'
            }
            for (i = 0; i < botsNumber; i++){
                bot.name = "bot" + i;
                var response = await request(app).post(`/bots?adminToken=${admin.token}`).send(bot);
                expect(response.status).to.eq(201);
            }

            // Get words
            var response = await request(app).get(`/bots?organizationId=${organization.id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(botsNumber);

            for (i = 0; i < botsNumber; i++){
                var bot = response.body.filter(b => b.name == 'bot' + i)[0];
                expect(bot).to.not.be.undefined;
            }
        });
    });

    describe('Delete bot', () => {
        it('should delete bot', async () => {
            var response = await request(app).post(`/bots?adminToken=${admin.token}`).send(bot);
            expect(response.status).to.eq(201);

            var response = await request(app).delete(`/bots/${response.body.id}?adminToken=${admin.token}`);
            expect(response.status).to.eq(204);

            // Get words
            var response = await request(app).get(`/bots?organizationId=${organization.id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(0);
        });
    });
});
