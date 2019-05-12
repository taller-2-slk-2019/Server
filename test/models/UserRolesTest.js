const chai = require('chai');
const expect = chai.expect;

var UserRoleCreator = require('../../src/models/userRoles/UserRoleCreator');
var UserRoleModerator = require('../../src/models/userRoles/UserRoleModerator');
var UserRoleMember = require('../../src/models/userRoles/UserRoleMember');

describe('"User Roles Tests"', () => {

    describe('Role Creator', () => {

        var role = new UserRoleCreator();

        it('must have organization permissions', async () => {
            expect(role.hasOrganizationPermissions()).to.be.true;
        });

        it('must have channel permissions', async () => {
            expect(role.hasChannelsPermissions()).to.be.true;
        });

        it('must have user permissions', async () => {
            expect(role.hasUserPermissions()).to.be.true;
        });
    });

    describe('Role Moderator', () => {

        var role = new UserRoleModerator();

        it('must not have organization permissions', async () => {
            expect(role.hasOrganizationPermissions()).to.be.false;
        });

        it('must have channel permissions', async () => {
            expect(role.hasChannelsPermissions()).to.be.true;
        });

        it('must have user permissions', async () => {
            expect(role.hasUserPermissions()).to.be.true;
        });
    });

    describe('Role Member', () => {

        var role = new UserRoleMember();

        it('must not have organization permissions', async () => {
            expect(role.hasOrganizationPermissions()).to.be.false;
        });

        it('must not have channel permissions', async () => {
            expect(role.hasChannelsPermissions()).to.be.false;
        });

        it('must not have user permissions', async () => {
            expect(role.hasUserPermissions()).to.be.false;
        });
    });
});