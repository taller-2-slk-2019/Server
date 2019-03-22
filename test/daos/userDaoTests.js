const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var UserDao = require('../../src/daos/UserDao');

var models = require('../../src/database/sequelize');
var User = models.user;
var { UserNotFoundError } = require('../../src/helpers/Errors');

describe('"UserDao Tests"', () => {

    describe('Register User', () => {

        var data = {name: "Pepe", surname: "Perez", email:"pepe@gmail.com", picture: "default"};
        var user;

        beforeEach(async () => {
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
        var data = {name: "Pepe", surname: "Perez", email:"pepe@gmail.com", picture: "default"};
        var expected;
        var user;

        before(async () => {
            expected = await User.create(data);
            user = await UserDao.findById(expected.id);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', expected.id);
        });
        
        it('user name must be Pepe', async () => {
            expect(user).to.have.property('name', "Pepe");
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

    describe('Find by id', () => {
        var data = {name: "Pepe", surname: "Perez", email:"pepe@gmail.com", picture: "default"};
        var edited = {name: "Carlos", surname: "Juarez"};
        var expected;
        var user;

        before(async () => {
            expected = await User.create(data);
            await UserDao.update(edited, expected.id);
            user = await User.findByPk(expected.id);
        });

        it('user must not be null', async () => {
            expect(user).to.not.be.null;
        });
        
        it('user must have correct id', async () => {
            expect(user).to.have.property('id', expected.id);
        });
        
        it('user name must be Carlos', async () => {
            expect(user).to.have.property('name', "Carlos");
        });

        it('user surname must be Juarez', async () => {
            expect(user).to.have.property('surname', "Juarez");
        });

        it('user email must not change', async () => {
            expect(user).to.have.property('email', "pepe@gmail.com");
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

    });

});
