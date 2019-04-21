const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var ForbiddenWordDao = require('../../src/daos/ForbiddenWordDao');

var Config = require('../../src/helpers/Config');
var models = require('../../src/database/sequelize');
var ForbiddenWord = models.forbiddenWord;
var Organization = models.organization;
var User = models.user;
var { ForbiddenWordAlreadyExistsError } = require('../../src/helpers/Errors');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"ForbiddenWordDao Tests"', () => {
    var user;
    var organization;
    var organizationData = Object.create(organizationCreateData);
    var wordData;

    before(async () => {
        user = await User.create(userCreateData());
        organizationData.creatorId = user.id;
        organization = await Organization.create(organizationData);
        wordData = {
            word: 'word',
            organizationId: organization.id
        }
    });


    describe('Create forbidden word', () => {
        var word;

        beforeEach(async () => {
            await ForbiddenWord.destroy({truncate: true});
            word = await ForbiddenWordDao.create(wordData);
        });

        it('word must be created', async () => {
            expect(word).to.not.be.null;
        });

        it('word must have an id', async () => {
            expect(word).to.have.property('id');
        });

        it('word organization must be correct', async () => {
            var org = await word.getOrganization();
            expect(org.id).to.eq(organization.id);
        });

        it('can not add same word to organization', async () => {
            await expect(ForbiddenWordDao.create(wordData)).to.eventually.be.rejectedWith(ForbiddenWordAlreadyExistsError);
        });
    });

    describe('Delete forbidden word', () => {
        var word;

        beforeEach(async () => {
            await ForbiddenWord.destroy({truncate: true});
            word = await ForbiddenWord.create(wordData);
            await ForbiddenWordDao.delete(word.id);
        });

        it('word must be deleted', async () => {
            var w = await ForbiddenWord.findByPk(word.id);
            expect(w).to.be.null;
        });

        it('organization must not have words', async () => {
            var words = await organization.getForbiddenWords();
            expect(words.length).to.eq(0);
        });

        it('delete again does not fails', async () => {
            await expect(ForbiddenWordDao.delete(word.id)).to.eventually.be.fulfilled;
        });
    });

    describe('Get forbidden words', () => {
        var word1;
        var word2;
        var words;

        before(async () => {
            word1 = await ForbiddenWord.create(wordData);
            word2 = await ForbiddenWord.create(wordData);
            words = await ForbiddenWordDao.get(organization.id);
        });

        it('words must not be null', async () => {
            expect(words).to.not.be.null;
        });

        it('must return two words', async () => {
            expect(words.length).to.eq(2);
        });

        it('must return correct words', async () => {
            expect(words[0].id).to.eq(word1.id);
        });
    });
});
