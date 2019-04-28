const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var BotDao = require('../../src/daos/BotDao');

var models = require('../../src/database/sequelize');
var Bot = models.bot;
var TestDatabaseHelper = require('../TestDatabaseHelper');
var { botCreateData } = require('../data/botData');

var { BotAlreadyExistsError } = require('../../src/helpers/Errors');

describe('"BotDao Tests"', () => {
    var organization;
    var botData = Object.create(botCreateData());

    before(async () => {
        organization = await TestDatabaseHelper.createOrganization();
        botData.organizationId = organization.id;
    });


    describe('Create bot', () => {
        var bot;

        beforeEach(async () => {
            await Bot.destroy({truncate: true});
            bot = await BotDao.create(botData);
        });

        it('bot must be created', async () => {
            expect(bot).to.not.be.null;
        });

        it('bot must have an id', async () => {
            expect(bot).to.have.property('id');
        });

        it('bot organization must be correct', async () => {
            var org = await bot.getOrganization();
            expect(org.id).to.eq(organization.id);
        });

        it('can not add same bot to organization', async () => {
            await expect(BotDao.create(botData)).to.eventually.be.rejectedWith(BotAlreadyExistsError);
        });
    });

    describe('Delete bot', () => {
        var bot;

        beforeEach(async () => {
            await Bot.destroy({truncate: true});
            bot = await TestDatabaseHelper.createBot(organization);
            await BotDao.delete(bot.id);
        });

        it('bot must be deleted', async () => {
            var b = await Bot.findByPk(bot.id);
            expect(b).to.be.null;
        });

        it('organization must not have words', async () => {
            var bots = await organization.getBots();
            expect(bots.length).to.eq(0);
        });

        it('delete again does not fails', async () => {
            await expect(BotDao.delete(bot.id)).to.eventually.be.fulfilled;
        });
    });

    describe('Get bots', () => {
        var bot1;
        var bot2;
        var bots;

        before(async () => {
            await Bot.destroy({truncate: true});
            bot1 = await TestDatabaseHelper.createBot(organization, 'bot1');
            bot2 = await TestDatabaseHelper.createBot(organization, 'bot2');
            bots = await BotDao.get(organization.id);
        });

        it('bots must not be null', async () => {
            expect(bots).to.not.be.null;
        });

        it('must return two bots', async () => {
            expect(bots.length).to.eq(2);
        });

        it('must return correct bots', async () => {
            expect([bots[0].id, bots[1].id]).to.include(bot1.id);
        });
    });

    describe('Find by name', () => {
        var bot1;
        var bot2;

        before(async () => {
            await Bot.destroy({truncate: true});
            bot1 = await TestDatabaseHelper.createBot(organization, 'bot3');
            bot2 = await TestDatabaseHelper.createBot(organization, 'bot4');
        });

        it('bot must not be null', async () => {
            var bot = await BotDao.findByName('bot4', organization.id);
            expect(bot).to.not.be.null;
        });

        it('must return correct bots', async () => {
            var bot = await BotDao.findByName('bot4', organization.id);
            expect(bot).to.have.property('name', 'bot4');
        });

        it('must return null if name does not exist', async () => {
            var bot = await BotDao.findByName('bot5', organization.id);
            expect(bot).to.be.null;
        });
    });
});
