const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var UserDao = require('../../src/daos/UserDao');
var OrganizationDao = require('../../src/daos/OrganizationDao');


var models = require('../../src/database/sequelize');
var User = models.user;
var Organization = models.organization;
var { UserNotFoundError } = require('../../src/helpers/Errors');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"UserDao Tests"', () => {

    describe('Register User', () => {
        var user;

        beforeEach(async () => {
            user = await UserDao.create(userCreateData);
        });

        it('user must be registered', async () => {
            expect(user).to.not.be.null;
        });

        it('user must hava an id', async () => {
            expect(user).to.have.property('id');
        });

        it('user name must be Pepe', async () => {
            expect(user.name).to.eq("Pepe");
        });

        it('user surname must be Perez', async () => {
            expect(user.surname).to.eq("Perez");
        });

        it('user email must be pepe@gmail.com', async () => {
            expect(user.email).to.eq("pepe@gmail.com");
        });
    });

    describe('Register User with errors', () => {

        it('empty user must not be registered', async () => {
            var data = {};
            expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('user must not be registered without name', async () => {
            var data = {surname: "Perez", email:"pepe@gmail.com"};
            expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('user must not be registered without surname', async () => {
            var data = {name: "Pepe", email:"pepe@gmail.com"};
            expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('user must not be registered without email', async () => {
            var data = {name: "Pepe", surname: "Perez"};
            expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });
    });

    describe('Find by id', () => {
        var expected;
        var user;

        before(async () => {
            expected = await User.create(userCreateData);
            user = await UserDao.findById(expected.id);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', expected.id);
        });
        
        it('user name must be correct', async () => {
            expect(user).to.have.property('name', expected.name);
        });

        it('throws exception if id does not exist', async () => {
            expect(UserDao.findById(9999999)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            expect(UserDao.findById(0)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            expect(UserDao.findById(-1)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

    });

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

    });

    describe('Find User Organizations', () => {
        var expected;
        var user;
        var token = "my-invitation-token-12345-to test invitations";
        var original;
        var updated;
        var organizationData = Object.create(organizationCreateData);

        before(async () => {
            user = await User.create(userCreateData);
            original = await UserDao.findUserOrganizations(user.id);

            organization = await Organization.create(organizationData);
            await organization.addInvitedUser(user, {through: {token: token}});
            await OrganizationDao.acceptUserInvitation(token);

            updated = await UserDao.findUserOrganizations(user.id);
        });

        it('user must not be created with an organization', async () => {
            expect(original).to.be.empty;
        });

        it('user must be in an organization after accepting invitation', async () => {
            expect(updated).to.not.be.empty;
        });

        it('user has the correct organizations id', async () => {
            expect(updated[0].organizationId).to.eq(organization.id);
        });

        it('the users role is: member', async () => {
            expect(updated[0].role).to.eq('member');
        });
    });

});
