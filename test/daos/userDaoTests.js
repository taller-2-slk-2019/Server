const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var UserDao = require('../../src/daos/UserDao');

var models = require('../../src/database/sequelize');
var User = models.User;
var { UserNotFoundError } = require('../../src/helpers/Errors');

describe('"UserDao Tests"', () => {

    describe('Register User without picture', () => {

        var data = {name: "Pepe", surname: "Perez", email:"pepe@gmail.com", picture: "default"};
        var user;

        beforeEach(async () => {
            user = await UserDao.create(data);
        });

        it('user must be registered', async () => {
            expect(user).to.not.be.null;
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

    describe('Method: Find by id', () => {
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
            //user = await UserDao.findById(9999999);
            //expect(user).to.be.null;
            expect(UserDao.findById(9999999)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            //user = await UserDao.findById(0);
            //expect(user).to.be.null;
            expect(UserDao.findById(0)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            //user = await UserDao.findById(-1);
            //expect(user).to.be.null;
            expect(UserDao.findById(-1)).to.eventually.be.rejectedWith(UserNotFoundError);
        });

    });

});
