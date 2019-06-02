const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var UserDao = require('../../src/daos/UserDao');
var OrganizationDao = require('../../src/daos/OrganizationDao');

var TestDatabaseHelper = require('../TestDatabaseHelper');

var models = require('../../src/database/sequelize');
var User = models.user;
var { UserNotFoundError } = require('../../src/helpers/Errors');
var { userCreateData } = require('../data/userData');

describe('"UserDao Tests"', () => {

    describe('Register User', () => {
        var user;
        var data;

        beforeEach(async () => {
            data = userCreateData();
            user = await UserDao.create(data);
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

        it('user email must be pepe@gmail.com', async () => {
            expect(user.email).to.eq(data.email);
        });

        it('register with same token does not update user', async () => {
            data.name = "other";
            user = await UserDao.create(data);
            expect(user.name).to.eq("Pepe");
        });
    });

    describe('Register User with errors', () => {

        it('empty user must not be registered', async () => {
            var data = {};
            await expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('user must not be registered without name', async () => {
            var data = {email:"pepe@gmail.com"};
            await expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('user must not be registered without token', async () => {
            var data = {name: "Pepe", email:"pepe@gmail.com"};
            await expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('user must not be registered without email', async () => {
            var data = {name: "Pepe", surname: "Perez"};
            await expect(UserDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });
    });

    describe('Find by id', () => {
        var expected;
        var user;

        before(async () => {
            expected = await TestDatabaseHelper.createUser();
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
            await expect(UserDao.findById(9999999)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            await expect(UserDao.findById(0)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            await expect(UserDao.findById(-1)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

    });

    describe('Update', () => {
        var edited = {name: "Carlos"};
        var original;
        var user;

        before(async () => {
            original = await TestDatabaseHelper.createUser();
            await UserDao.update(edited, original.token);
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

        it('user email must not change', async () => {
            expect(user).to.have.property('email', original.email);
        });

        it('throws exception if token does not exist', async () => {
            await expect(UserDao.update(edited, "unexistant token")).to.eventually.be.rejectedWith(UserNotFoundError);
        });


        it('throws if name is null', async () => {
            newEdited = Object.create(edited);
            newEdited.name = null;
            await expect(UserDao.update(newEdited, original.token)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

    });

    describe('Find by email', () => {
        var expected;
        var user;
        var email = "pepeTestFindEmail@unique.gmail.com";

        before(async () => {
            expected = await TestDatabaseHelper.createUser(email);
            user = await UserDao.findByEmail(email);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', expected.id);
        });
        
        it('user email must be correct', async () => {
            expect(user).to.have.property('email', email);
        });

        it('throws exception if email does not exist', async () => {
            await expect(UserDao.findByEmail("fdsfsdf@unexistantEmail.gmail.blabla.com")).to.eventually.be.rejectedWith(UserNotFoundError);
        });
    });

    describe('Find by token', () => {
        var data = Object.create(userCreateData());
        data.token = "uniqueToken123456";
        var expected;
        var user;

        before(async () => {
            expected = await User.create(data);
            user = await UserDao.findByToken(data.token);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', expected.id);
        });

        it('throws exception if token does not exist', async () => {
            await expect(UserDao.findByToken("fdsfsdf@unexistantToken.gmail.blabla.com")).to.eventually.be.rejectedWith(UserNotFoundError);
        });
    });

    describe('Find by username', () => {
        var data = Object.create(userCreateData());
        data.username = "uniqueUSername1234566789";
        var expected;
        var user;

        before(async () => {
            expected = await User.create(data);
            user = await UserDao.findByUsername(data.username);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', expected.id);
        });

        it('throws exception if token does not exist', async () => {
            await expect(UserDao.findByUsername("fdsfsdf@unexistantToken.gmail.blabla.com")).to.eventually.be.rejectedWith(UserNotFoundError);
        });
    });

    describe('Username exists', () => {
        var data = Object.create(userCreateData());
        data.username = "uniqueUsername1234";

        before(async () => {
            await User.create(data);
        });

        it('username must exist', async () => {
            var exists = await UserDao.usernameExists("uniqueUsername1234");
            expect(exists).to.be.true;
        });

        it('username must not exist', async () => {
            var exists = await UserDao.usernameExists("uniqueUsername123456");
            expect(exists).to.be.false;
        });

        it('empty username must not exist', async () => {
            var exists = await UserDao.usernameExists("");
            expect(exists).to.be.false;
        });
    });   
});
