const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var UserService = require('../../src/services/UserService');
var MessageStatisticsDao = require('../../src/daos/MessageStatisticsDao');

var TestDatabaseHelper = require('../TestDatabaseHelper');

describe('"UserService Tests"', () => {
    var user;
    var org1, org2;
    var mock;

    before(async () => {
        mock = stub(MessageStatisticsDao, 'getMessagesCountByUser').resolves(10);

        user = await TestDatabaseHelper.createUser();
        org1 = await TestDatabaseHelper.createOrganization([user]);
        org2 = await TestDatabaseHelper.createOrganization([user]);
    });

    after(async () => {
        mock.restore();
    });

    describe('Get statistics', () => {
        var stats;

        beforeEach(async () => {
            stats = await UserService.getStatistics(user.token);
        });

        it('must return 2 organizations', async () => {
            expect(stats.organizations.length).to.eq(2);
        });
        
        it('org1 must be in organizations', async () => {
            expect(stats.organizations).to.include(org1.name);
        });

        it('must return 10 messages sent', async () => {
            expect(stats.messagesSent).to.eq(10);
        });
    });

    describe('Find user organizations', () => {
        var organizations;

        before(async () => {
            organizations = await UserService.findUserOrganizations(user.token);
        });

        it('must return 2 organizations', async () => {
            expect(organizations.length).to.eq(2);
        });
        
        it('organizations must have correct id', async () => {
            expect(organizations[0]).to.have.property('id', org1.id);
        });

        it('organization must have user', async () => {
            var belongs = await organizations[0].hasUser(user);
            expect(belongs).to.be.true;
        });
    });

    describe('Find user invitations', () => {
        var user;
        var org;

        before(async () => {
            user = await TestDatabaseHelper.createUser()
            org = await TestDatabaseHelper.createOrganization();
        });

        beforeEach(async () => {
            await user.setOrganizationInvitations([]);
        });

        it('user invitations must be empty', async () => {
            var invitations = await UserService.findUserInvitations(user.token);
            expect(invitations.length).to.eq(0);
        });

        it('user invitations must not be empty', async () => {
            await user.addOrganizationInvitation(org, {through: {token: "123"}});
            var invitations = await UserService.findUserInvitations(user.token);
            expect(invitations.length).to.eq(1);
        });

        it('user invitations must have correct token', async () => {
            await user.addOrganizationInvitation(org, {through: {token: "12345"}});
            var invitations = await UserService.findUserInvitations(user.token);
            expect(invitations[0].organizationUserInvitation).to.have.property("token", "12345");
        });
    });

    describe('Delete user invitation', () => {
        var user;
        var org;

        before(async () => {
            user = await TestDatabaseHelper.createUser()
            org = await TestDatabaseHelper.createOrganization();
        });

        beforeEach(async () => {
            await user.setOrganizationInvitations([]);
        });

        it('user invitations must be empty', async () => {
            await user.addOrganizationInvitation(org, {through: {token: "token123"}});
            await UserService.deleteUserInvitation('token123');
            var invitations = await user.getOrganizationInvitations();
            expect(invitations.length).to.eq(0);
        });

        it('must delete correct invitation', async () => {
            await user.addOrganizationInvitation(org, {through: {token: "token123"}});
            await user.addOrganizationInvitation(org, {through: {token: "token124"}});
            await UserService.deleteUserInvitation('token123');
            var invitations = await user.getOrganizationInvitations();
            expect(invitations.length).to.eq(1);
        });

        it('must not delete incorrect invitation', async () => {
            await user.addOrganizationInvitation(org, {through: {token: "token123"}});
            await user.addOrganizationInvitation(org, {through: {token: "token124"}});
            await UserService.deleteUserInvitation('token123');
            var invitations = await user.getOrganizationInvitations();
            expect(invitations[0].organizationUserInvitation).to.have.property("token", "token124");
        });
    });
});
