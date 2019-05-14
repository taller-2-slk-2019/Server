const Creator = require('../models/userRoles/UserRoleCreator');
const Moderator = require('../models/userRoles/UserRoleModerator');
const Member = require('../models/userRoles/UserRoleMember');

class UserRoleFactory {

    get roles() { return Object.keys(this.allRoles); }

    get allRoles() {
        return {
            'creator': new Creator(),
            'moderator': new Moderator(),
            'member': new Member()
        };
    }

    getRole(role) {
        if (!this.roles.includes(role)) {
            throw new Error(`Invalid role ${role}`);
        }
        return this.allRoles[role];
    }
}

module.exports = new UserRoleFactory();