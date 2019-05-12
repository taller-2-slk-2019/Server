const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, assert } = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockRequest, mockResponse } = require('mock-req-res');

var RequestRolePermissions = require('../../src/helpers/RequestRolePermissions');
var { UnauthorizedUserError } = require('../../src/helpers/Errors');
var AdminDao = require('../../src/daos/AdminUserDao');
var UserDao = require('../../src/daos/UserDao');
var UserRoleDao = require('../../src/daos/UserRoleDao');

describe('"RequestRolePermissions Tests"', () => {
    var mockAdmin, mockUser, mockRole;

    before(async () => {
        mockAdmin = stub(AdminDao, 'findByToken').rejects();
        mockAdmin.withArgs("token").resolves();
        
        mockUser = stub(UserDao, 'findByToken').rejects();
        mockUser.withArgs("token").resolves();
       // mockRole = stub(UserRoleDao, 'getUserRole').resolves();
    });

    after(async () => {
        mockAdmin.restore();
        mockUser.restore();
        //mockRole.restore();
    });

    describe('Admin permissions', () => {
        it('should resolve if admin exists', async () => {
            var req = mockRequest({ query: {adminToken: "token"} });
            await expect(RequestRolePermissions.checkAdminPermissions(req)).to.eventually.be.fulfilled;
        });

        it('should reject if admin not exists', async () => {
            var req = mockRequest({ query: {adminToken: "invalid token"} })
            await expect(RequestRolePermissions.checkAdminPermissions(req)).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });
    });
});