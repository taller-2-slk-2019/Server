const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub } = require('sinon');

var MessageStatisticsDao = require('../../src/daos/MessageStatisticsDao');
var TestDatabaseHelper = require('../TestDatabaseHelper');


describe('"MessageStatisticsDao Tests"', () => {
    var user, user2;
    var organization;
    var channel, conversation;
    

    before(async () => {
        user = await TestDatabaseHelper.createUser();
        user2 = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user]);
        channel = await TestDatabaseHelper.createChannel(user, organization);
        conversation = await TestDatabaseHelper.createConversation(user, user2, organization);

        for (i = 0; i < 15; i++){
            await TestDatabaseHelper.createChannelMessage("hola", channel, user);
        }
        for (i = 0; i < 3; i++){
            await TestDatabaseHelper.createConversationMessage("hola", conversation, user2, 'code');
        }
        await TestDatabaseHelper.createConversationMessage("hola", conversation, user2, 'image');
        await TestDatabaseHelper.createConversationMessage("hola", conversation, user2, 'file');
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

    describe('Get message count by organization', () => {
        it('message count must include channel and conversation messages', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByOrganization(organization);
            var total = count.reduce((sum, c) => sum + Number(c.count), 0);
            expect(total).to.eq(20);
        });

        it('must return correct count for text type', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByOrganization(organization);
            var total = Number(count.filter(c => c.type == 'text')[0].count);
            expect(total).to.eq(15);
        });

        it('must return correct count for code type', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByOrganization(organization);
            var total = Number(count.filter(c => c.type == 'code')[0].count);
            expect(total).to.eq(3);
        });

        it('must return correct count for image type', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByOrganization(organization);
            var total = Number(count.filter(c => c.type == 'image')[0].count);
            expect(total).to.eq(1);
        });

        it('must return correct count for file type', async () => {
            var count = await MessageStatisticsDao.getMessagesCountByOrganization(organization);
            var total = Number(count.filter(c => c.type == 'file')[0].count);
            expect(total).to.eq(1);
        });
    });

});
