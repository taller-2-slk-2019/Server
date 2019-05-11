class UserRoleFactory {

    get roles() { return ['creator', 'moderator', 'member']; }
}

module.exports = new UserRoleFactory();