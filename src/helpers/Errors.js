class UserNotFoundError extends Error {
    constructor(userId) {
        super("User not found: " + userId);
        this.name = this.constructor.name;
    }
}

class OrganizationNotFoundError extends Error {
    constructor(organizationId) {
        super("Organization not found: " + organizationId);
        this.name = this.constructor.name;
    }
}

module.exports = {
    UserNotFoundError: UserNotFoundError,
    OrganizationNotFoundError: OrganizationNotFoundError,
}