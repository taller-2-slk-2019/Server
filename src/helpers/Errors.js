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

class UserAlreadyInvitedError extends Error {
    constructor(organizationId, userId) {
        super(`User ${userId} is already invited to organization ${organizationId}`);
        this.name = this.constructor.name;
    }
}

class UserAlreadyInOrganizationError extends Error {
    constructor(organizationId, userId) {
        super(`User ${userId} already belongs to organization ${organizationId}`);
        this.name = this.constructor.name;
    }
}

class InvalidOrganizationInvitationTokenError extends Error {
    constructor(token) {
        super("Invalid token to be invited to an organization: " + token);
        this.name = this.constructor.name;
    }
}

class InvalidLocationError extends Error {
    constructor() {
        super("Location must have a latitude and a longitude");
        this.name = this.constructor.name;
    }
}

module.exports = {
    UserNotFoundError: UserNotFoundError,
    OrganizationNotFoundError: OrganizationNotFoundError,
    UserAlreadyInvitedError: UserAlreadyInvitedError,
    UserAlreadyInOrganizationError: UserAlreadyInOrganizationError,
    InvalidOrganizationInvitationTokenError: InvalidOrganizationInvitationTokenError,
    InvalidLocationError,
};