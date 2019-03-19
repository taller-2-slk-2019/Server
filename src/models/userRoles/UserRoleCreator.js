var UserRole = require('./UserRole');

class UserRoleCreator extends UserRole {

    constructor (){
        super('creator');
    }

    hasOrganizationPermissions(){
        return true;
    }

    hasChannelsPermissions(){
        return true;
    }

    hasUserPermissions(){
        return true;
    }

    hasRolePermissions(){
        return true;
    }
}

module.exports = UserRoleCreator;