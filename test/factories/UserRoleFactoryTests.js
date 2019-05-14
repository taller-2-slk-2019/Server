const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub } = require('sinon');

const UserRoleFactory = require('../../src/factories/UserRoleFactory');


describe('"UserRoleFactory Tests"', () => {

    describe('Get role', () => {
        it('should return correct role', async () => {
            UserRoleFactory.roles.forEach(role => {
                var result = UserRoleFactory.getRole(role);
                expect(result.name).to.eq(role);
            });
        });

        it('should return error if role does not exist', async () => {
            expect(() => { UserRoleFactory.getRole('some role'); }).to.throw();
        });
    });

});
