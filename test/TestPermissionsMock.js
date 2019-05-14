const { stub } = require('sinon');
var RequestRolePermissions = require('../src/helpers/RequestRolePermissions');

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
    }

    rejectPermissions(){
        this.restore();
        this.mocks.push(stub(RequestRolePermissions, 'checkAdminPermissions').rejects());
        this.mocks.push(stub(RequestRolePermissions, 'checkOrganizationPermissions').rejects());
        this.mocks.push(stub(RequestRolePermissions, 'checkChannelPermissions').rejects());
        this.mocks.push(stub(RequestRolePermissions, 'checkUserPermissions').rejects());
    }

    restore(){
        this.mocks.forEach(mock => {
            mock.restore();
        });
        this.mocks = [];
    }
    
}

module.exports = new TestPermissionsMock();