const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var UserDao = require('../../src/daos/UserDao');

describe('"UserDao Tests"', () => {

    describe('Register User without picture', () => {

        var data = {name: "Pepe", surname: "Perez", email:"pepe@gmail.com"};
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
            expect(UserDao.create(data)).to.eventually.be.rejected;
        });

        it('user must not be registered without name', async () => {
            var data = {surname: "Perez", email:"pepe@gmail.com"};
            expect(UserDao.create(data)).to.eventually.be.rejected;
        });

        it('user must not be registered without surname', async () => {
            var data = {name: "Pepe", email:"pepe@gmail.com"};
            expect(UserDao.create(data)).to.eventually.be.rejected;
        });

        it('user must not be registered without email', async () => {
            var data = {name: "Pepe", surname: "Perez"};
            expect(UserDao.create(data)).to.eventually.be.rejected;
        });
    });

});