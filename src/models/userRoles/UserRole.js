class UserRole {

    constructor (name){
        this.name = name;
    }

    hasOrganizationPermissions(){
        return false;
    }

    hasChannelsPermissions(){
        return false;
    }

    hasUserPermissions(){
        return false;
    }
}

module.exports = UserRole;