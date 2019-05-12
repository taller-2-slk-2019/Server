const { stub } = require('sinon');
var RequestRolePermissions = require('../src/helpers/RequestRolePermissions');

class TestPermissionsMock {
    constructor(){
        this.mocks = [];
    }

    allowPermissions(){
        this.restore();
        this.mocks.push(stub(RequestRolePermissions, 'checkAdminPermissions').resolves());
    }

    rejectPermissions(){
        this.restore();
        this.mocks.push(stub(RequestRolePermissions, 'checkAdminPermissions').rejects());
    }

    restore(){
        this.mocks.forEach(mock => {
            mock.restore();
        });
        this.mocks = [];
    }
    
}

module.exports = new TestPermissionsMock();