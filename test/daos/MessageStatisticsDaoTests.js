const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub } = require('sinon');

var MessageStatisticsDao = require('../../src/daos/MessageStatisticsDao');
var TestDatabaseHelper = require('../TestDatabaseHelper');


describe('"MessageStatisticsDao Tests"', () => {
    var user;
    var organization;
    var channel;
    

    before(async () => {
        user = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user]);
        channel = await TestDatabaseHelper.createChannel(user, organization);
        for (i = 0; i < 15; i++){
            await TestDatabaseHelper.createChannelMessage("hola", channel, user);
        }
    });

    describe('Get message count by channel', () => {
        it('message count must be 15 for channel with messages', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByChannel(channel.id);
            expect(count).to.eq(15);
        });

        it('message count must be 0 for unexistant channel', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByChannel(99999);
            expect(count).to.eq(0);
        });
    });

    describe('Get message count by user', () => {
        it('message count must be 15 for user with messages', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByUser(user.id);
            expect(count).to.eq(15);
        });

        it('message count must be 0 for unexistant user', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByUser(99999);
            expect(count).to.eq(0);
        });
    });

});
