const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var RequestStatsDao = require('../../src/daos/RequestStatsDao');

var models = require('../../src/database/sequelize');
var RequestStats = models.requestStats;
var { requestStatsData } = require('../data/requestStatsData');

describe('"RequestStatsDao Tests"', () => {
    describe('Save', () => {
        var stats;
        var data = Object.create(requestStatsData[0]);

        beforeEach(async () => {
            stats = await RequestStatsDao.save(data);
        });

        it('stats must be created', async () => {
            expect(stats).to.not.be.null;
        });

        it('stats status code must be correct', async () => {
            expect(stats.statusCode).to.eq(data.statusCode);
        });
    });

    describe('Get', () => {
        var stats;
        var data1 = Object.create(requestStatsData[0]);
        var data2 = Object.create(requestStatsData[1]);

        var oldData = Object.create(data1);
        oldData.createdAt = '2018-01-01';

        beforeEach(async () => {
            await RequestStats.destroy({truncate: true});
            await RequestStats.create(data1);
            await RequestStats.create(data2);
            await RequestStats.create(oldData);
            stats = await RequestStatsDao.get();
        });

        it('stats must contain 2 stats', async () => {
            expect(stats.length).to.eq(2);
        });
    });
});
