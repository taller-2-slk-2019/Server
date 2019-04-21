var UserRole = require('./UserRole');

class UserRoleMember extends UserRole {

    constructor (){
        super('member');
    }
}

module.exports = UserRoleMember;