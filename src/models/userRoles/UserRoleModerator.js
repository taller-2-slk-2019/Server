var UserRole = require('./UserRole');

class UserRoleModerator extends UserRole {

    constructor (){
        super('moderator');
    }

    hasChannelsPermissions(){
        return true;
    }

    hasUserPermissions(){
        return true;
    }
}

module.exports = UserRoleModerator;