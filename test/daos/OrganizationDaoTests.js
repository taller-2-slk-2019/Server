const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var OrganizationDao = require('../../src/daos/OrganizationDao');
var FirebaseService = require('../../src/firebase/FirebaseService');

var models = require('../../src/database/sequelize');
var Organization = models.organization;
var Channel = models.channel;
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { UserNotFoundError, OrganizationNotFoundError,
            InvalidOrganizationInvitationTokenError, UserNotBelongsToOrganizationError } = require('../../src/helpers/Errors');
var { organizationCreateData } = require('../data/organizationData');

var CreatorRole = require('../../src/models/userRoles/UserRoleCreator');
var MemberRole = require('../../src/models/userRoles/UserRoleMember');

describe('"OrganizationDao Tests"', () => {
    var user;
    var organizationData = Object.create(organizationCreateData);
    var creatorRole = new CreatorRole();
    var memberRole = new MemberRole();
    var firebaseMock;

    before(async () => {
        firebaseMock = stub(FirebaseService, 'sendOrganizationInvitationNotification').resolves();

        user = await TestDatabaseHelper.createUser();
        organizationData.creatorToken = user.token;
    });

    after(async () => {
        firebaseMock.restore();
    });

    describe('Create Organization', () => {
        var organization;

        beforeEach(async () => {
            organization = await OrganizationDao.create(organizationData);
        });

        it('organization must be created', async () => {
            expect(organization).to.not.be.null;
        });

        it('organization must have an id', async () => {
            expect(organization).to.have.property('id');
        });

        it('organization must have an user', async () => {
            var users = await organization.getUsers();
            expect(users.length).to.eq(1);
        });

        it('creator must belong to organization', async () => {
            var users = await organization.getUsers();
            expect(users[0].id).to.eq(user.id);
        });

        it('creator must have creator role', async () => {
            var users = await organization.getUsers();
            expect(users[0].userOrganizations.role).to.eq(creatorRole.name);
        });
    });

    describe('Create organization with errors', () => {
        var organization;
        var data;

        beforeEach(async () => {
            data = Object.create(organizationData);
        });

        it('organization must not be created without creator', async () => {
            data.creatorToken = "abc";
            await expect(OrganizationDao.create(data)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('organization must not be created with empty data', async () => {
            await expect(OrganizationDao.create({})).to.eventually.be.rejectedWith(SequelizeValidationError);
        });
    });

    describe('Update', () => {
        var edited = {name: "My organization edited"};
        var original;
        var organization, user;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            original = await TestDatabaseHelper.createOrganization([user]);
            await OrganizationDao.update(edited, original.id);
            organization = await Organization.findByPk(original.id);
        });

        it('organization must not be null', async () => {
            expect(organization).to.not.be.null;
        });
        
        it('organization must have correct id', async () => {
            expect(organization).to.have.property('id', original.id);
        });
        
        it('organization name must be updated', async () => {
            expect(organization).to.have.property('name', edited.name);
        });

        it('organization description must not change', async () => {
            expect(organization).to.have.property('description', original.description);
        });

        it('throws exception if id does not exist', async () => {
            await expect(OrganizationDao.update(edited, 0)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws if name is null', async () => {
            newEdited = Object.create(edited);
            newEdited.name = null;
            await expect(OrganizationDao.update(newEdited, original.id)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

    });

    describe('Find by id', () => {
        var expected;
        var organization;

        before(async () => {
            expected = await TestDatabaseHelper.createOrganization();
            organization = await OrganizationDao.findById(expected.id);
        });

        it('organization must not be null', async () => {
            expect(organization).to.not.be.null;
        });
        
        it('organization must have correct id', async () => {
            expect(organization).to.have.property('id', expected.id);
        });
        
        it('organization name must be correct', async () => {
            expect(organization).to.have.property('name', expected.name);
        });

        it('throws exception if id does not exist', async () => {
            await expect(OrganizationDao.findById(9999999)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            await expect(OrganizationDao.findById(0)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            await expect(OrganizationDao.findById(-1)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });
    });

    describe('Get', () => {
        var organization1;
        var organization2;
        var user1;
        var user2;
        var organizations;

        before(async () => {
            user1 = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            organization1 = await TestDatabaseHelper.createOrganization([user1]);
            organization2 = await TestDatabaseHelper.createOrganization([user2]);
            
            organizations = await OrganizationDao.get();
        });

        it('must return 2 organizations', async () => {
            expect(organizations.length).to.be.above(2);
        });
        
        it('organizations must have correct id', async () => {
            var ids = organizations.map(org => {return org.id});
            expect(ids).to.include(organization1.id);
            expect(ids).to.include(organization2.id);
        });
    });

    describe('Delete', () => {
        var channel
        var organization;
        var user;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            organization = await TestDatabaseHelper.createOrganization([user]);
            channel = await TestDatabaseHelper.createChannel(user, organization);
            await OrganizationDao.delete(organization.id);
        });

        it('organization must be deleted', async () => {
            var org = await Organization.findByPk(organization.id);
            expect(org).to.be.null;
        });

        it('delete again fails', async () => {
            await expect(OrganizationDao.delete(organization.id)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('organization channels must be deleted', async () => {
            var c = await Channel.findByPk(channel.id);
            expect(c).to.be.null;
        });
    });

});
