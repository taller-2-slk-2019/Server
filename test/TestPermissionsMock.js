const { stub } = require('sinon');
var RequestRolePermissions = require('../src/helpers/RequestRolePermissions');
var { UnauthorizedUserError } = require('../src/helpers/Errors');

class TestPermissionsMock {
    constructor(){
        this.mocks = [];
    }

    allowPermissions(){
        this.restore();
        this.mocks.push(stub(RequestRolePermissions, 'checkAdminPermissions').resolves());
        this.mocks.push(stub(RequestRolePermissions, 'checkOrganizationPermissions').resolves());
        this.mocks.push(stub(RequestRolePermissions, 'checkChannelPermissions').resolves());
        this.mocks.push(stub(RequestRolePermissions, 'checkUserPermissions').resolves());
        this.mocks.push(stub(RequestRolePermissions, 'checkBotPermissions').resolves());
    }

    rejectPermissions(){
        this.restore();
        var exception = new UnauthorizedUserError();
        this.mocks.push(stub(RequestRolePermissions, 'checkAdminPermissions').rejects(exception));
        this.mocks.push(stub(RequestRolePermissions, 'checkOrganizationPermissions').rejects(exception));
        this.mocks.push(stub(RequestRolePermissions, 'checkChannelPermissions').rejects(exception));
        this.mocks.push(stub(RequestRolePermissions, 'checkUserPermissions').rejects(exception));
        this.mocks.push(stub(RequestRolePermissions, 'checkBotPermissions').rejects(exception));
    }

    restore(){
        this.mocks.forEach(mock => {
            mock.restore();
        });
        this.mocks = [];
    }
    
}

module.exports = new TestPermissionsMock();