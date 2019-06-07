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

describe('"Forbidden word Integration Tests"', () => {
    var user, organization, word;

    beforeEach(async () => {
        admin = await IntegrationTestsHelper.createAdmin();
        user = await IntegrationTestsHelper.createUser();
        organization = await IntegrationTestsHelper.createOrganization(user);
        word = {
            organizationId: organization.id,
            word: 'word'
        }
    });

    describe('Forbidden word Creation', () => {
        it('should return word data', async () => {
            var response = await request(app).post(`/forbidden-words?adminToken=${admin.token}`).send(word);
            expect(response.status).to.eq(201);

            expect(response.body.id).to.be.above(0);
            expect(response.body.word).to.eq(word.word);
        });

        it('should not create repeated word', async () => {
            var response = await request(app).post(`/forbidden-words?adminToken=${admin.token}`).send(word);
            expect(response.status).to.eq(201);

            var response = await request(app).post(`/forbidden-words?adminToken=${admin.token}`).send(word);
            expect(response.status).to.eq(400);
        });
    });

    describe('Get forbidden words', () => {
        it('should get all forbidden words', async () => {
            var wordsNumber = 10;
            word = {
                organizationId: organization.id,
            }
            for (i = 0; i < wordsNumber; i++){
                word.word = "word" + i;
                var response = await request(app).post(`/forbidden-words?adminToken=${admin.token}`).send(word);
                expect(response.status).to.eq(201);
            }

            // Get words
            var response = await request(app).get(`/forbidden-words?organizationId=${organization.id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(wordsNumber);

            for (i = 0; i < wordsNumber; i++){
                var word = response.body.filter(w => w.word == 'word' + i)[0];
                expect(word).to.not.be.undefined;
            }
        });
    });

    describe('Delete forbidden word', () => {
        it('should delete forbidden words', async () => {
            var response = await request(app).post(`/forbidden-words?adminToken=${admin.token}`).send(word);
            expect(response.status).to.eq(201);

            var response = await request(app).delete(`/forbidden-words/${response.body.id}?adminToken=${admin.token}`);
            expect(response.status).to.eq(204);

            // Get words
            var response = await request(app).get(`/forbidden-words?organizationId=${organization.id}`);
            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(0);
        });
    });
});
