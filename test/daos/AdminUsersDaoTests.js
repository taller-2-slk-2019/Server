const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var AdminUserDao = require('../../src/daos/AdminUserDao');

var models = require('../../src/database/sequelize');
var Admin = models.adminUser;
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { AdminUserNotFoundError } = require('../../src/helpers/Errors');

describe('"AdminUserDao Tests"', () => {
    var admin;

    before(async () => {
        admin = await TestDatabaseHelper.createAdminUser();
    });


    describe('Login', () => {
        var loggedIn;

        beforeEach(async () => {
            loggedIn = await AdminUserDao.login(admin.username, admin.password);
        });

        it('admin must not be null', async () => {
            expect(loggedIn).to.not.be.null;
        });

        it('admin must have an id', async () => {
            expect(loggedIn).to.have.property('id');
        });

        it('admin must have token', async () => {
            expect(loggedIn).to.have.property('token', admin.token);
        });

        it('admin must not have password', async () => {
            expect(loggedIn.password).to.be.undefined;
        });

        it('login invalid username fails', async () => {
            await expect(AdminUserDao.login("invalid", "123456")).to.eventually.be.rejectedWith(AdminUserNotFoundError);
        });

        it('login invalid password fails', async () => {
            await expect(AdminUserDao.login(admin.username, "123456")).to.eventually.be.rejectedWith(AdminUserNotFoundError);
        });
    });

    describe('Find by token', () => {
        var adminUser;

        before(async () => {
            adminUser = await AdminUserDao.findByToken(admin.token);
        });

        it('user must not be null', async () => {
            expect(adminUser).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(adminUser).to.have.property('id', admin.id);
        });

        it('throws exception if token does not exist', async () => {
            await expect(AdminUserDao.findByToken("fdsfsdf@unexistantToken.gmail.blabla.com")).to.eventually.be.rejectedWith(AdminUserNotFoundError);
        });
    });
});
