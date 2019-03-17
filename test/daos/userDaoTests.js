var expect = require('chai').expect;
var UserDao = require('../../src/daos/UserDao');

describe('"UserDao Tests"', () => {

    describe('Method: Register User without picture', () => {

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

        it('user surname and must be Perez', async () => {
            expect(user.surname).to.eq("Perez");
        });

        it('user email and must be pepe@gmail.com', async () => {
            expect(user.email).to.eq("pepe@gmail.com");
        });
    });

});