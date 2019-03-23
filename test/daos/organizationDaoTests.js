const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var OrganizationDao = require('../../src/daos/OrganizationDao');

var models = require('../../src/database/sequelize');
var User = models.user;
var Organization = models.organization;
var { UserNotFoundError, OrganizationNotFoundError } = require('../../src/helpers/Errors');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');
var CreatorRole = require('../../src/models/userRoles/UserRoleCreator');

describe('"OrganizationDao Tests"', () => {
    var user;
    var organizationData = Object.create(organizationCreateData);
    var creatorRole = new CreatorRole();

    before(async () => {
        user = await User.create(userCreateData);
        organizationData.creatorId = user.id;
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
            data.creatorId = -2;
            expect(OrganizationDao.create(data)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('organization must not be created with empty data', async () => {
            expect(OrganizationDao.create({})).to.eventually.be.rejectedWith(SequelizeValidationError);
        });
    });

    describe('Find by id', () => {
        var expected;
        var organization;

        before(async () => {
            expected = await Organization.create(organizationData);
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
            expect(OrganizationDao.findById(9999999)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            expect(OrganizationDao.findById(0)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            expect(OrganizationDao.findById(-1)).to.eventually.be.rejectedWith(OrganizationNotFoundError);
        });

    });
/*
    describe('Update', () => {
        var edited = {name: "Carlos", surname: "Juarez"};
        var original;
        var user;

        before(async () => {
            original = await User.create(userCreateData);
            await UserDao.update(edited, original.id);
            user = await User.findByPk(original.id);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', original.id);
        });
        
        it('user name must be updated', async () => {
            expect(user).to.have.property('name', edited.name);
        });

        it('user surname must be updated', async () => {
            expect(user).to.have.property('surname', edited.surname);
        });

        it('user email must not change', async () => {
            expect(user).to.have.property('email', original.email);
        });

        it('throws exception if id does not exist', async () => {
            expect(UserDao.update(edited, 9999999)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            expect(UserDao.update(edited, 0)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            expect(UserDao.update(edited, -1)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws if name is null', async () => {
            newEdited = Object.create(edited);
            newEdited.name = null;
            expect(UserDao.update(newEdited, original.id)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('throws if surnamename is null', async () => {
            newEdited = Object.create(edited);
            newEdited.surname = null;
            expect(UserDao.update(newEdited, original.id)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

    });

    describe('Find by email', () => {
        var data = Object.create(userCreateData);
        data.email = "pepeTestFindEmail@unique.gmail.com";
        var expected;
        var user;

        before(async () => {
            expected = await User.create(data);
            user = await UserDao.findByEmail(data.email);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', expected.id);
        });
        
        it('user email must be correct', async () => {
            expect(user).to.have.property('email', data.email);
        });

        it('throws exception if email does not exist', async () => {
            expect(UserDao.findByEmail("fdsfsdf@unexistantEmail.gmail.blabla.com")).to.eventually.be.rejectedWith(UserNotFoundError);
        });

    });*/

});
