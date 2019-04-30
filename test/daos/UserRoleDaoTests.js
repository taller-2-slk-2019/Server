const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub } = require('sinon');

var UserRoleDao = require('../../src/daos/UserRoleDao');
var TestDatabaseHelper = require('../TestDatabaseHelper');


describe('"UserRoleDao Tests"', () => {
    var user, user2, user3, user4, user5;
    var organization;
    

    before(async () => {
        user = await TestDatabaseHelper.createUser();
        user2 = await TestDatabaseHelper.createUser();
        user3 = await TestDatabaseHelper.createUser();
        user4 = await TestDatabaseHelper.createUser();
        user5 = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization();

        await organization.addUser(user, {through: {role:'creator'}});
        await organization.addUser(user2, {through: {role:'moderator'}});
        await organization.addUser(user3, {through: {role:'member'}});
        await organization.addUser(user4, {through: {role:'member'}});
        await organization.addUser(user5, {through: {role:'member'}});
    });

    describe('Get role count by organization', () => {
        it('user count must include all users', async () => {
            var count = await UserRoleDao.getCountForOrganization(organization.id);
            var total = count.reduce((sum, c) => sum + Number(c.count), 0);
            expect(total).to.eq(5);
        });

        it('user count must be 0 for unexistant organization', async () => {
            var count = await UserRoleDao.getCountForOrganization(999999);
            var total = count.reduce((sum, c) => sum + Number(c.count), 0);
            expect(total).to.eq(0);
        });

        it('must return correct count for creator', async () => {
            var count = await UserRoleDao.getCountForOrganization(organization.id);
            var total = Number(count.filter(c => c.role == 'creator')[0].count);
            expect(total).to.eq(1);
        });

        it('must return correct count for moderator', async () => {
            var count = await UserRoleDao.getCountForOrganization(organization.id);
            var total = Number(count.filter(c => c.role == 'moderator')[0].count);
            expect(total).to.eq(1);
        });

        it('must return correct count for member', async () => {
            var count = await UserRoleDao.getCountForOrganization(organization.id);
            var total = Number(count.filter(c => c.role == 'member')[0].count);
            expect(total).to.eq(3);
        });
    });

});
