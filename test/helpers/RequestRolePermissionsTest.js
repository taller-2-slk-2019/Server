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
var ChannelDao = require('../../src/daos/ChannelDao');
var userMock = require('../mocks/userProfileMock');
var channelMock = Object.create(require('../mocks/channelDataMock'));

describe('"RequestRolePermissions Tests"', () => {
    var mockAdmin, mockUser, mockRole, mockChannel;

    before(async () => {
        mockAdmin = stub(AdminDao, 'findByToken').rejects();
        mockAdmin.withArgs("token").resolves();
        
        mockUser = stub(UserDao, 'findByToken').rejects();
        mockUser.withArgs("token").resolves(userMock);

        mockChannel = stub(ChannelDao, 'findById').resolves(channelMock);

        mockRole = stub(UserRoleDao, 'getUserRole').rejects();
        mockRole.withArgs('creator').resolves('creator');
        mockRole.withArgs('moderator').resolves('moderator');
        mockRole.withArgs('member').resolves('member');
    });

    after(async () => {
        mockAdmin.restore();
        mockUser.restore();
        mockRole.restore();
        mockChannel.restore();
    });

    describe('Admin permissions', () => {
        it('should resolve if admin exists', async () => {
            var req = mockRequest({ query: {adminToken: "token"} });
            await expect(RequestRolePermissions.checkAdminPermissions(req)).to.eventually.be.fulfilled;
        });

        it('should reject if admin not exists', async () => {
            var req = mockRequest({ query: {adminToken: "invalid token"} });
            await expect(RequestRolePermissions.checkAdminPermissions(req)).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });
    });

    describe('Organization permissions', () => {
        it('should resolve if admin exists', async () => {
            var req = mockRequest({ query: {adminToken: "token"} });
            await expect(RequestRolePermissions.checkOrganizationPermissions(req)).to.eventually.be.fulfilled;
        });

        it('should resolve if user role has permission', async () => {
            var req = mockRequest({ query: {userToken: "token"} });
            await expect(RequestRolePermissions.checkOrganizationPermissions(req, "creator")).to.eventually.be.fulfilled;
        });

        it('should reject if user role does not have permission', async () => {
            var req = mockRequest({ query: {userToken: "token"} });
            await expect(RequestRolePermissions.checkOrganizationPermissions(req, "member")).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });

        it('should reject if user does not exist', async () => {
            var req = mockRequest({ query: {userToken: " invalidtoken"} });
            await expect(RequestRolePermissions.checkOrganizationPermissions(req)).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });
    });

    describe('Channel permissions', () => {
        it('should resolve if admin exists', async () => {
            var req = mockRequest({ query: {adminToken: "token"} });
            await expect(RequestRolePermissions.checkChannelPermissions(req)).to.eventually.be.fulfilled;
        });

        it('should resolve if user role has permission', async () => {
            var req = mockRequest({ query: {userToken: "token"} });
            channelMock.organizationId = "creator";
            await expect(RequestRolePermissions.checkChannelPermissions(req, "creator")).to.eventually.be.fulfilled;
        });

        it('should reject if user role does not have permission', async () => {
            var req = mockRequest({ query: {userToken: "token"} });
            channelMock.organizationId = "member";
            await expect(RequestRolePermissions.checkChannelPermissions(req, "member")).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });

        it('should reject if user does not exist', async () => {
            var req = mockRequest({ query: {userToken: " invalidtoken"} });
            channelMock.organizationId = "creator";
            await expect(RequestRolePermissions.checkChannelPermissions(req)).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });
    });

    describe('User permissions', () => {
        it('should resolve if admin exists', async () => {
            var req = mockRequest({ query: {adminToken: "token"} });
            await expect(RequestRolePermissions.checkUserPermissions(req)).to.eventually.be.fulfilled;
        });

        it('should resolve if user role has permission', async () => {
            var req = mockRequest({ query: {userToken: "token"} });
            await expect(RequestRolePermissions.checkUserPermissions(req, "creator")).to.eventually.be.fulfilled;
        });

        it('should reject if user role does not have permission', async () => {
            var req = mockRequest({ query: {userToken: "token"} });
            await expect(RequestRolePermissions.checkUserPermissions(req, "member")).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });

        it('should reject if user does not exist', async () => {
            var req = mockRequest({ query: {userToken: " invalidtoken"} });
            await expect(RequestRolePermissions.checkUserPermissions(req)).to.eventually.be.rejectedWith(UnauthorizedUserError);
        });
    });
});